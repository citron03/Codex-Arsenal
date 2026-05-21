import { access } from "node:fs/promises";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MANIFEST } from "../lib/manifest.js";

describe("manifest", () => {
  it("provides the top-level repository sections promised by the README", async () => {
    for (const directory of [
      "plugins",
      "skills",
      "prompts",
      "workflows",
      "configs",
      "references",
      "examples"
    ]) {
      await access(directory);
    }
  });

  it("contains the README categories with installable items", () => {
    const categories = new Set(MANIFEST.map((item) => item.category));

    assert.deepEqual([...categories].sort(), [
      "Behavior Guidelines",
      "Configs",
      "Plugins",
      "Prompts",
      "Skills",
      "Workflows"
    ]);
  });

  it("points every file entry at an existing repository file", async () => {
    for (const item of MANIFEST) {
      assert.ok(item.id, "item id is required");
      assert.ok(item.label, `${item.id} label is required`);
      assert.ok(item.description, `${item.id} description is required`);
      assert.ok(item.files.length > 0, `${item.id} must install at least one file`);

      for (const file of item.files) {
        await access(file.src);
      }
    }
  });
});
