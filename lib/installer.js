import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, MANIFEST } from "./manifest.js";
import { fetchFile } from "./fetcher.js";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readSourceFile(src) {
  try {
    return await readFile(path.join(PACKAGE_ROOT, src), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return fetchFile(`${BASE_URL}/${src}`);
  }
}

export async function installItems(items, targetDir, opts = {}) {
  const resolvedTarget = path.resolve(targetDir);
  let installed = 0;
  let failed = 0;
  const successes = [];
  const skipped = [];
  const failures = [];
  const readSource = opts.readSourceFile || readSourceFile;
  const force = !!opts.force;

  for (const item of items) {
    for (const file of item.files) {
      const destination = path.join(resolvedTarget, file.dest);
      try {
        if (!force) {
          try {
            await readFile(destination, "utf8");
            skipped.push(file.dest);
            continue;
          } catch (error) {
            if (error.code !== "ENOENT") {
              throw error;
            }
          }
        }

        const content = await readSource(file.src);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, content, "utf8");
        installed += 1;
        successes.push(file.dest);
      } catch (error) {
        failed += 1;
        failures.push({ item: item.id, file: file.src, dest: file.dest, error: error.message });
      }
    }
  }

  return { installed, failed, successes, skipped, failures, targetDir: resolvedTarget };
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
    return { installed: 0, failed: 0, successes: [], skipped: [], failures: [], targetDir: path.resolve(opts.dir || ".") };
  }

  const result = await installItems(selected, opts.dir || process.cwd(), {
    readSourceFile: opts.readSourceFile,
    force: opts.force
  });
  for (const file of result.successes) {
    console.log(`installed ${file}`);
  }
  for (const file of result.skipped) {
    console.log(`skipped ${file} (already exists; use --force to overwrite)`);
  }
  for (const failure of result.failures) {
    console.log(`failed ${failure.dest} (${failure.error})`);
  }
  console.log(
    `\nDone: ${result.installed} installed${result.skipped.length ? `, ${result.skipped.length} skipped` : ""}${result.failed ? `, ${result.failed} failed` : ""}.`
  );
  return result;
}
