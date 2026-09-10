import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { installItems, runInit } from "../lib/installer.js";
import { MANIFEST } from "../lib/manifest.js";

describe("installer", () => {
  it("copies selected manifest files into the target directory", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const item = MANIFEST.find((entry) => entry.id === "agents-md");

    try {
      const result = await installItems([item], targetDir);
      const copied = await readFile(join(targetDir, "AGENTS.md"), "utf8");

      assert.equal(result.installed, 1);
      assert.equal(result.failed, 0);
      assert.deepEqual(result.successes, ["AGENTS.md"]);
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

  it("skips existing files by default instead of overwriting user content", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const item = MANIFEST.find((entry) => entry.id === "agents-md");

    try {
      await writeFile(join(targetDir, "AGENTS.md"), "user content", "utf8");

      const result = await installItems([item], targetDir);
      const copied = await readFile(join(targetDir, "AGENTS.md"), "utf8");

      assert.equal(result.installed, 0);
      assert.equal(result.failed, 0);
      assert.deepEqual(result.successes, []);
      assert.deepEqual(result.skipped, ["AGENTS.md"]);
      assert.equal(copied, "user content");
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it("overwrites existing files only when force is enabled", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const item = MANIFEST.find((entry) => entry.id === "agents-md");

    try {
      await writeFile(join(targetDir, "AGENTS.md"), "user content", "utf8");

      const result = await installItems([item], targetDir, { force: true });
      const copied = await readFile(join(targetDir, "AGENTS.md"), "utf8");

      assert.equal(result.installed, 1);
      assert.equal(result.failed, 0);
      assert.deepEqual(result.skipped, []);
      assert.match(copied, /Behavioral guidelines/);
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it("reads packaged source files instead of target files when forcing from a target cwd", async () => {
    const targetDir = await mkdtemp(join(tmpdir(), "codex-arsenal-"));
    const originalCwd = process.cwd();
    const item = MANIFEST.find((entry) => entry.id === "agents-md");

    try {
      await writeFile(join(targetDir, "AGENTS.md"), "user content", "utf8");
      process.chdir(targetDir);

      const result = await installItems([item], targetDir, { force: true });
      const copied = await readFile(join(targetDir, "AGENTS.md"), "utf8");

      assert.equal(result.installed, 1);
      assert.match(copied, /Behavioral guidelines/);
    } finally {
      process.chdir(originalCwd);
      await rm(targetDir, { recursive: true, force: true });
    }
  });

  it("refuses to overwrite through a symbolic link, even with --force", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "codex-arsenal-symlink-"));
    const targetDir = join(rootDir, "target");
    const outsideFile = join(rootDir, "outside.txt");
    const item = MANIFEST.find((entry) => entry.id === "agents-md");

    try {
      await mkdir(targetDir, { recursive: true });
      await writeFile(outsideFile, "original", "utf8");
      await symlink(outsideFile, join(targetDir, "AGENTS.md"));

      const result = await installItems([item], targetDir, { force: true });

      assert.equal(result.installed, 0);
      assert.equal(result.failed, 1);
      assert.match(result.failures[0].error, /Refusing to write through a symbolic link/);
      assert.equal(await readFile(outsideFile, "utf8"), "original");
    } finally {
      await rm(rootDir, { recursive: true, force: true });
    }
  });

  it("rejects manifest destinations outside the target directory", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "codex-arsenal-boundary-"));
    const targetDir = join(rootDir, "target");
    const outsideFile = join(rootDir, "escape.txt");

    try {
      const result = await installItems(
        [{ id: "unsafe-item", files: [{ src: "source.txt", dest: "../escape.txt" }] }],
        targetDir,
        { readSourceFile: async () => "unsafe content" }
      );

      assert.equal(result.installed, 0);
      assert.equal(result.failed, 1);
      assert.match(result.failures[0].error, /escapes target directory/);
      await assert.rejects(readFile(outsideFile, "utf8"), { code: "ENOENT" });
    } finally {
      await rm(rootDir, { recursive: true, force: true });
    }
  });
});
