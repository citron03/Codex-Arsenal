import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { assertNotSymlink, pathExists, resolveContainedPath } from "./safe-paths.js";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const execFileAsync = promisify(execFile);

export function resolveConfigPath(cwd = process.cwd()) {
  return path.join(cwd, ".codex", "session-config.json");
}

export function resolvePackageAsset(...segments) {
  return path.join(PACKAGE_ROOT, ...segments);
}

export function defaultNoteTargets() {
  return {
    sessionInitializer: "Codex/Session-Initializer.md",
    codeStyle: "Codex/Code-Style.md",
    meaningfulWork: "Codex/Meaningful-Work.md"
  };
}

export function defaultLaunchTemplates() {
  return {
    open: null,
    reveal: null
  };
}

export function normalizeVaultPath(vaultPath, cwd = process.cwd()) {
  if (!vaultPath) {
    return null;
  }
  if (vaultPath.startsWith("~")) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    return path.resolve(homeDir, vaultPath.slice(1).replace(/^\//, ""));
  }
  return path.resolve(cwd, vaultPath);
}

export function getVaultName(vaultPath) {
  return path.basename(vaultPath);
}

export function slugifyTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "session-note";
}

export function isoDateInSeoul(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeTemplateValue(value, context) {
  if (typeof value === "string") {
    return value
      .replaceAll("{vault}", context.vaultName)
      .replaceAll("{vaultPath}", context.vaultRoot)
      .replaceAll("{file}", context.filePath)
      .replaceAll("{mode}", context.mode);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeTemplateValue(item, context));
  }

  return value;
}

export function resolveObsidianLaunchSpec({
  cwd = process.cwd(),
  config,
  filePath,
  mode = "open"
} = {}) {
  const resolvedConfig = config || {};
  const obsidian = resolvedConfig.obsidian || {};
  if (!obsidian.enabled) {
    return { type: "disabled" };
  }

  const vaultRoot = normalizeVaultPath(obsidian.vaultPath, cwd);
  const vaultName = getVaultName(vaultRoot);
  const notePath = filePath || obsidian.noteTargets?.sessionInitializer || defaultNoteTargets().sessionInitializer;
  const absoluteNotePath = resolveContainedPath(vaultRoot, notePath, "Obsidian note must be inside the vault");
  const relativeFilePath = path.relative(vaultRoot, absoluteNotePath);

  // Obsidian CLI arguments and obsidian:// URIs use vault-relative POSIX paths,
  // even when this bridge runs on Windows.
  const vaultRelativeFilePath = relativeFilePath.split(path.sep).join("/");

  const templates = {
    ...defaultLaunchTemplates(),
    ...(obsidian.launch || {})
  };
  const template = templates[mode];

  if (template) {
    return {
      type: "command",
      command: template.command || obsidian.cliCommand || "obsidian",
      args: normalizeTemplateValue(template.args || [], {
        vaultName,
        vaultRoot,
        filePath: vaultRelativeFilePath,
        mode
      }),
      cwd: vaultRoot
    };
  }

  return {
    type: "uri",
    uri: `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(vaultRelativeFilePath)}`
  };
}

export async function launchObsidianTarget(spec, runner = execFileAsync) {
  if (spec.type === "disabled") {
    return { launched: false, mode: "disabled" };
  }

  if (spec.type === "command") {
    await runner(spec.command, spec.args, { cwd: spec.cwd });
    return { launched: true, mode: "command" };
  }

  if (spec.type === "uri") {
    if (process.platform === "darwin") {
      await runner("open", [spec.uri]);
    } else if (process.platform === "linux") {
      await runner("xdg-open", [spec.uri]);
    } else if (process.platform === "win32") {
      await runner("cmd", ["/c", "start", "", spec.uri]);
    } else {
      throw new Error(`Unsupported platform for launching Obsidian: ${process.platform}`);
    }
    return { launched: true, mode: "uri" };
  }

  throw new Error(`Unknown Obsidian launch spec type: ${spec.type}`);
}

export async function loadSessionConfig(cwd = process.cwd(), readJson = readJsonFile) {
  const projectConfigPath = resolveConfigPath(cwd);

  try {
    return await readJson(projectConfigPath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const packageConfigPath = resolvePackageAsset("configs", "codex", "session-config.json");
  return readJson(packageConfigPath);
}

export function shouldDraftArticle({ signals = [], config, integrationBoundary = false }) {
  if (integrationBoundary) {
    return true;
  }

  const minimumSignals = config?.articleRules?.minimumSignalsForDraft ?? 2;
  return signals.length >= minimumSignals;
}

export function buildArticleMarkdown({
  title,
  summary,
  changes = [],
  decisions = [],
  verification = [],
  nextSteps = [],
  signals = []
}) {
  const sections = [
    `# ${title}`,
    "",
    `- Date: ${isoDateInSeoul()}`,
    signals.length ? `- Signals: ${signals.join(", ")}` : null,
    "",
    "## Why It Mattered",
    summary || "TBD",
    "",
    "## What Changed",
    ...(changes.length ? changes.map((change) => `- ${change}`) : ["- TBD"]),
    "",
    "## Decisions",
    ...(decisions.length ? decisions.map((decision) => `- ${decision}`) : ["- TBD"]),
    "",
    "## Verification",
    ...(verification.length ? verification.map((item) => `- ${item}`) : ["- TBD"]),
    "",
    "## Next Steps",
    ...(nextSteps.length ? nextSteps.map((step) => `- ${step}`) : ["- TBD"])
  ];

  return sections.filter((line) => line !== null).join("\n");
}

async function readSourceMarkdown(relativePath, cwd = process.cwd()) {
  if (path.isAbsolute(relativePath)) {
    return readFile(relativePath, "utf8");
  }

  const localPath = path.resolve(cwd, relativePath);
  try {
    return await readFile(localPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return readFile(resolvePackageAsset(relativePath), "utf8");
}

async function ensureDirectoryFor(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function writeIfNeeded(destination, content, force) {
  if (!force && (await pathExists(destination))) {
    return "skipped";
  }

  await assertNotSymlink(destination);
  await ensureDirectoryFor(destination);
  await writeFile(destination, content, "utf8");
  return "written";
}

export async function syncObsidianNotes({ cwd = process.cwd(), config, force = false, readSource = readSourceMarkdown } = {}) {
  const resolvedConfig = config || (await loadSessionConfig(cwd));
  const obsidian = resolvedConfig.obsidian || {};
  if (!obsidian.enabled) {
    return { synced: [], skipped: [], targetVault: null };
  }

  const vaultRoot = normalizeVaultPath(obsidian.vaultPath, cwd);
  const targets = {
    ...defaultNoteTargets(),
    ...(obsidian.noteTargets || {})
  };

  const notes = [
    {
      src: resolvedConfig.sessionInitializer || "prompts/session-bootstrap.md",
      dest: targets.sessionInitializer
    },
    {
      src: resolvedConfig.codeStyleNote || "prompts/code-style.md",
      dest: targets.codeStyle
    },
    {
      src: resolvedConfig.meaningfulWorkNote || "prompts/meaningful-work.md",
      dest: targets.meaningfulWork
    }
  ];

  const synced = [];
  const skipped = [];

  for (const note of notes) {
    const sourceContent = await readSource(note.src, cwd);
    const destination = resolveContainedPath(vaultRoot, note.dest, "Obsidian note must be inside the vault");
    const status = await writeIfNeeded(destination, sourceContent, force);
    if (status === "written") {
      synced.push(note.dest);
    } else {
      skipped.push(note.dest);
    }
  }

  return { synced, skipped, targetVault: vaultRoot };
}

export async function draftObsidianArticle({
  cwd = process.cwd(),
  config,
  title,
  summary,
  changes = [],
  decisions = [],
  verification = [],
  nextSteps = [],
  signals = [],
  integrationBoundary = false,
  force = false
} = {}) {
  const resolvedConfig = config || (await loadSessionConfig(cwd));
  const obsidian = resolvedConfig.obsidian || {};
  if (!obsidian.enabled) {
    return { written: null, skipped: true, targetVault: null };
  }

  if (!shouldDraftArticle({ signals, config: resolvedConfig, integrationBoundary })) {
    return { written: null, skipped: true, targetVault: normalizeVaultPath(obsidian.vaultPath, cwd) };
  }

  const vaultRoot = normalizeVaultPath(obsidian.vaultPath, cwd);
  const inboxPath = obsidian.inboxPath || "Inbox/Codex";
  const articleTitle = title || "Codex Session Article";
  const fileName = `${isoDateInSeoul()}-${slugifyTitle(articleTitle)}.md`;
  const destination = resolveContainedPath(
    vaultRoot,
    path.join(inboxPath, fileName),
    "Obsidian article must be inside the vault"
  );
  const content = buildArticleMarkdown({
    title: articleTitle,
    summary,
    changes,
    decisions,
    verification,
    nextSteps,
    signals
  });

  const status = await writeIfNeeded(destination, content, force);
  return { written: status === "written" ? path.relative(vaultRoot, destination) : null, skipped: status !== "written", targetVault: vaultRoot };
}

export async function openObsidianNote({
  cwd = process.cwd(),
  config,
  filePath,
  mode = "open",
  runner
} = {}) {
  const spec = resolveObsidianLaunchSpec({ cwd, config, filePath, mode });
  const result = await launchObsidianTarget(spec, runner);
  return { ...result, spec };
}
