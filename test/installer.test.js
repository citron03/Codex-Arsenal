import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { installItems, runInit } from "../lib/installer.js";
import { MANIFEST } from "../lib/manifest.js";

describe("installer", () => {
  it("copies selected manifest files into the target directory", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const item = MANIFEST.find((entry) => entry.id === "codex-md");

    try {
      const result = await installItems([item], targetDir);
      const copied = await readFile(join(targetDir, "CODEX.md"), "utf8");

      assert.equal(result.installed, 1);
      assert.equal(result.failed, 0);
      assert.deepEqual(result.successes, ["CODEX.md"]);
      assert.match(copied, /Behavioral guidelines/);
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it("does not log an install message for failed files", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const originalLog = console.log;
    const messages = [];

    console.log = (message = "") => {
      messages.push(String(message));
    };

    try {
      const result = await runInit({
        preSelected: [
          {
            id: "broken-item",
            files: [{ src: "missing.txt", dest: "missing.txt" }]
          }
        ],
        skipPrompt: true,
        dir: targetDir,
        readSourceFile: async () => {
          throw new Error("boom");
        }
      });

      assert.equal(result.installed, 0);
      assert.equal(result.failed, 1);
      assert.deepEqual(result.successes, []);
      assert.doesNotMatch(messages.join("\n"), /installed missing\.txt/);
      assert.match(messages.join("\n"), /failed missing\.txt \(boom\)/);
    } finally {
      console.log = originalLog;
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
