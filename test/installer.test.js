import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { installItems } from "../lib/installer.js";
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
      assert.match(copied, /Behavioral guidelines/);
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
