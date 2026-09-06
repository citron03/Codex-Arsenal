#!/usr/bin/env node
import { MANIFEST, findManifestItems } from "../lib/manifest.js";
import { runInit } from "../lib/installer.js";
import { readOption } from "../lib/cli-options.js";

function printHelp() {
  console.log(`codex-arsenal

Usage:
  codex-arsenal init [--yes] [--force] [--dir <path>]
  codex-arsenal list
  codex-arsenal get <id...> [--force] [--dir <path>]

By default, existing files are skipped. Use --force to overwrite them.
`);
}

function nonOptionArgs(args) {
  const result = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dir" || arg === "-d") {
      index += 1;
      continue;
    }
    if (arg === "--yes" || arg === "-y" || arg === "--force") {
      continue;
    }
    result.push(arg);
  }
  return result;
}

function printList() {
  let currentCategory = "";
  for (const item of MANIFEST) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      console.log(`\n${currentCategory}`);
    }
    console.log(`  ${item.id.padEnd(32)} ${item.description}`);
  }
  console.log();
}

async function main(argv) {
  const [command = "init", ...args] = argv;
  const dir = readOption(args, "--dir", readOption(args, "-d", process.cwd()));
  const force = args.includes("--force");

  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "list") {
    printList();
    return;
  }

  if (command === "get") {
    const ids = nonOptionArgs(args);
    if (!ids.length) {
      throw new Error("get requires at least one item id");
    }
    await runInit({ preSelected: findManifestItems(ids), skipPrompt: true, dir, force });
    return;
  }

  if (command === "init") {
    await runInit({ yes: args.includes("--yes") || args.includes("-y"), dir, force });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
