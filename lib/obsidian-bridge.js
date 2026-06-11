import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  if (!force) {
    try {
      await readFile(destination, "utf8");
      return "skipped";
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

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
    const destination = path.join(vaultRoot, note.dest);
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
  const destination = path.join(vaultRoot, inboxPath, fileName);
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
