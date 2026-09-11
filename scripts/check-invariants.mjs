#!/usr/bin/env node
// Enforces the repository invariants that documentation asserts but nothing
// checked. Each one corresponds to a mistake that reached a branch and was
// caught by eye rather than by a machine.
//
// Every check takes the root it inspects, so test/check-invariants.test.js can
// run them against fixtures rather than against this repository.
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ID_COLUMN_WIDTH, MANIFEST } from "../lib/manifest.js";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "coverage"]);

async function markdownFiles(dir, found = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await markdownFiles(full, found);
    } else if (entry.name.endsWith(".md")) {
      found.push(full);
    }
  }
  return found;
}

function readmeIdsByCategory(readme) {
  const byCategory = new Map();
  let current = null;

  for (const line of readme.split("\n")) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1];
      continue;
    }
    if (/^##\s/.test(line)) {
      current = null;
      continue;
    }
    const row = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (row && current) {
      if (!byCategory.has(current)) {
        byCategory.set(current, []);
      }
      byCategory.get(current).push(row[1]);
    }
  }

  return byCategory;
}

// The README item tables and lib/manifest.js are two views of one list. They
// drifted out of order once already, which `codex-arsenal list` does not reveal.
export async function checkReadmeMatchesManifest(root, manifest) {
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  const documented = readmeIdsByCategory(readme);
  const failures = [];

  const declared = new Map();
  for (const item of manifest) {
    if (!declared.has(item.category)) {
      declared.set(item.category, []);
    }
    declared.get(item.category).push(item.id);
  }

  for (const [category, ids] of declared) {
    const documentedIds = documented.get(category);
    if (!documentedIds) {
      failures.push(`README has no "### ${category}" table, but the manifest declares ${ids.length} item(s) in it`);
      continue;
    }
    if (documentedIds.join(",") !== ids.join(",")) {
      failures.push(
        `README "${category}" table does not match the manifest\n` +
          `      manifest: ${ids.join(", ")}\n` +
          `      README:   ${documentedIds.join(", ")}`
      );
    }
  }

  for (const [category, ids] of documented) {
    if (!declared.has(category)) {
      failures.push(`README "### ${category}" table lists ${ids.join(", ")}, but no manifest item uses that category`);
    }
  }

  return { failures, detail: `${manifest.length} items across ${declared.size} categories` };
}

// `codex-arsenal list` pads ids to a fixed column. An id longer than the column
// pushes its description out of alignment for that row only, which is easy to
// miss in review.
export function checkIdsFitTheListColumn(manifest, columnWidth) {
  const tooLong = manifest.filter((item) => item.id.length > columnWidth);
  const longest = Math.max(...manifest.map((item) => item.id.length));
  return {
    failures: tooLong.map(
      (item) => `manifest id "${item.id}" is ${item.id.length} characters; the list column is ${columnWidth}`
    ),
    detail: `longest id ${longest}, column ${columnWidth}`
  };
}

// A skill is addressed by its directory name in the manifest and by its
// frontmatter name to the agent. Renaming one and not the other leaves a skill
// that installs correctly and is invoked by a name that no longer exists.
export async function checkSkillNamesMatchDirectories(root) {
  const skillsRoot = path.join(root, "skills");
  const failures = [];
  let checked = 0;

  for (const entry of await readdir(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    let contents;
    try {
      contents = await readFile(path.join(skillsRoot, entry.name, "SKILL.md"), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        continue; // Older skills ship a README and prompt instead; the manifest declares what each one installs.
      }
      throw error;
    }

    checked += 1;
    const declared = contents.match(/^name:\s*(.+?)\s*$/m);
    if (!declared) {
      failures.push(`skills/${entry.name}/SKILL.md has no "name:" in its frontmatter`);
    } else if (declared[1] !== entry.name) {
      failures.push(`skills/${entry.name}/SKILL.md declares name "${declared[1]}"`);
    }
  }

  return { failures, detail: `${checked} SKILL.md file(s)` };
}

// Renaming a shipped file touched ten documents at once. A link that no longer
// resolves is invisible until a reader clicks it.
export async function checkRelativeLinksResolve(root) {
  const files = await markdownFiles(root);
  const failures = [];
  let links = 0;

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    // The optional trailing group matches a link title, so `[x](path "Title")`
    // is checked rather than silently skipped.
    for (const match of contents.matchAll(/\]\(\s*(?!https?:|mailto:|#)([^)\s]+)(?:\s+"[^"]*")?\s*\)/g)) {
      links += 1;
      const target = path.resolve(path.dirname(file), match[1].split("#")[0]);
      if (!existsSync(target)) {
        failures.push(`${path.relative(root, file)} links to "${match[1]}", which does not exist`);
      }
    }
  }

  return { failures, detail: `${links} relative link(s) in ${files.length} file(s)` };
}

// The commit-type table is stated in three documents, one of which is installed
// into users' projects and so cannot simply link to the others. All three
// claimed `!` meant a major release while the analyzer ignored the marker
// entirely; two of them stayed wrong after the first was corrected.
export const RELEASE_TABLE_FILES = [
  "README.md",
  "docs/npm-publishing.md",
  "skills/publishing-npm-packages/SKILL.md"
];

function releaseTable(contents) {
  const rows = [];
  let inTable = false;

  for (const line of contents.split("\n")) {
    if (/^\|\s*Commit\s*\|\s*Release\s*\|/.test(line)) {
      inTable = true;
    }
    if (inTable) {
      if (!line.startsWith("|")) {
        break;
      }
      rows.push(line.trim());
    }
  }

  return rows;
}

export async function checkReleaseTablesAgree(root, files = RELEASE_TABLE_FILES) {
  const failures = [];
  const tables = new Map();

  for (const file of files) {
    const rows = releaseTable(await readFile(path.join(root, file), "utf8"));
    if (!rows.length) {
      failures.push(`${file} has no "| Commit | Release |" table`);
      continue;
    }
    tables.set(file, rows);
  }

  const [reference, ...others] = [...tables.entries()];
  if (reference) {
    for (const [file, rows] of others) {
      if (rows.join("\n") !== reference[1].join("\n")) {
        failures.push(
          `${file} states a different commit-type table from ${reference[0]}\n` +
            `      only in ${reference[0]}: ${reference[1].filter((r) => !rows.includes(r)).join(" / ") || "(none)"}\n` +
            `      only in ${file}: ${rows.filter((r) => !reference[1].includes(r)).join(" / ") || "(none)"}`
        );
      }
    }
  }

  return { failures, detail: `${tables.size} copies agree` };
}

export function repositoryChecks(root = REPO_ROOT, manifest = MANIFEST, columnWidth = ID_COLUMN_WIDTH) {
  return [
    ["README tables match the manifest", () => checkReadmeMatchesManifest(root, manifest)],
    ["manifest ids fit the list column", () => checkIdsFitTheListColumn(manifest, columnWidth)],
    ["skill names match their directories", () => checkSkillNamesMatchDirectories(root)],
    ["relative links resolve", () => checkRelativeLinksResolve(root)],
    ["release tables agree", () => checkReleaseTablesAgree(root)]
  ];
}

async function main() {
  let failed = 0;
  console.log("check-invariants\n");

  for (const [label, check] of repositoryChecks()) {
    const { failures, detail } = await check();
    if (failures.length) {
      failed += failures.length;
      console.log(`  FAIL  ${label}`);
      for (const failure of failures) {
        console.log(`        ${failure}`);
      }
    } else {
      console.log(`  ok    ${label} (${detail})`);
    }
  }

  if (failed) {
    console.log(`\n${failed} invariant violation(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll invariants hold.");
  }
}

// Only run when invoked directly, so the test suite can import the checks.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main();
}
