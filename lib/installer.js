import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import { BASE_URL, MANIFEST } from "./manifest.js";
import { fetchFile } from "./fetcher.js";

async function readSourceFile(src) {
  try {
    return await readFile(src, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return fetchFile(`${BASE_URL}/${src}`);
  }
}

export async function installItems(items, targetDir) {
  const resolvedTarget = path.resolve(targetDir);
  let installed = 0;
  let failed = 0;
  const failures = [];

  for (const item of items) {
    for (const file of item.files) {
      const destination = path.join(resolvedTarget, file.dest);
      try {
        const content = await readSourceFile(file.src);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, content, "utf8");
        installed += 1;
      } catch (error) {
        failed += 1;
        failures.push({ item: item.id, file: file.src, error: error.message });
      }
    }
  }

  return { installed, failed, failures, targetDir: resolvedTarget };
}

function defaultItems() {
  return MANIFEST.filter((item) => item.default);
}

async function askForItems(preSelected = defaultItems()) {
  const rl = createInterface({ input, output });
  try {
    console.log("\nInstallable Codex-Arsenal items:\n");
    MANIFEST.forEach((item, index) => {
      const checked = preSelected.some((selected) => selected.id === item.id) ? "*" : " ";
      console.log(`${String(index + 1).padStart(2, " ")}. [${checked}] ${item.id} - ${item.description}`);
    });
    const answer = await rl.question("\nChoose item numbers separated by commas, or press Enter for defaults: ");
    if (!answer.trim()) {
      return preSelected;
    }

    const selectedIndexes = answer
      .split(",")
      .map((part) => Number(part.trim()) - 1)
      .filter((index) => Number.isInteger(index) && MANIFEST[index]);

    return selectedIndexes.map((index) => MANIFEST[index]);
  } finally {
    rl.close();
  }
}

export async function runInit(opts = {}) {
  const selected = opts.skipPrompt || opts.yes
    ? opts.preSelected || defaultItems()
    : await askForItems(opts.preSelected || defaultItems());

  if (!selected.length) {
    console.log("No items selected.");
    return { installed: 0, failed: 0, failures: [], targetDir: path.resolve(opts.dir || ".") };
  }

  const result = await installItems(selected, opts.dir || process.cwd());
  for (const item of selected) {
    for (const file of item.files) {
      console.log(`installed ${file.dest}`);
    }
  }
  console.log(`\nDone: ${result.installed} installed${result.failed ? `, ${result.failed} failed` : ""}.`);
  return result;
}
