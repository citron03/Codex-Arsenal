#!/usr/bin/env node
import {
  draftObsidianArticle,
  loadSessionConfig,
  syncObsidianNotes
} from "../lib/obsidian-bridge.js";

function printHelp() {
  console.log(`codex-obsidian-bridge

Usage:
  codex-obsidian-bridge sync [--dir <path>] [--force]
  codex-obsidian-bridge draft --title <text> --summary <text> [options]

Options:
  --dir <path>             Project root that contains .codex/session-config.json
  --force                  Overwrite existing Obsidian notes
  --title <text>           Article title
  --summary <text>         Short summary of why the work mattered
  --changes <items>        Comma-separated list of change bullets
  --decisions <items>      Comma-separated list of decision bullets
  --verification <items>   Comma-separated list of verification bullets
  --next-steps <items>     Comma-separated list of follow-up bullets
  --signals <items>        Comma-separated list of meaningful-work signals
  --integration-boundary   Force an article when a new integration is introduced
`);
}

function readOption(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  if (index === -1) {
    return fallback;
  }
  return args[index + 1] || fallback;
}

function readListOption(args, name) {
  const value = readOption(args, name, "");
  if (!value) {
    return [];
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

async function main(argv) {
  const [command = "help", ...args] = argv;
  const cwd = readOption(args, "--dir", process.cwd());
  const force = args.includes("--force");

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  const config = await loadSessionConfig(cwd);

  if (command === "sync") {
    const result = await syncObsidianNotes({ cwd, config, force });
    for (const file of result.synced) {
      console.log(`synced ${file}`);
    }
    for (const file of result.skipped) {
      console.log(`skipped ${file} (already exists; use --force to overwrite)`);
    }
    console.log(`target vault: ${result.targetVault}`);
    return;
  }

  if (command === "draft") {
    const result = await draftObsidianArticle({
      cwd,
      config,
      title: readOption(args, "--title"),
      summary: readOption(args, "--summary"),
      changes: readListOption(args, "--changes"),
      decisions: readListOption(args, "--decisions"),
      verification: readListOption(args, "--verification"),
      nextSteps: readListOption(args, "--next-steps"),
      signals: readListOption(args, "--signals"),
      integrationBoundary: args.includes("--integration-boundary"),
      force
    });

    if (result.skipped) {
      console.log("no article drafted");
      return;
    }

    console.log(`drafted ${result.written}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
