import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BASE_URL, MANIFEST, REPO } from "../lib/manifest.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("manifest", () => {
  it("uses the real GitHub repository for published package fetches", () => {
    assert.equal(REPO, "citron03/Codex-Arsenal");
    assert.equal(BASE_URL, "https://raw.githubusercontent.com/citron03/Codex-Arsenal/main");
  });

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
      await access(path.join(REPO_ROOT, directory));
    }
  });

  it("contains the README categories with installable items", () => {
    const categories = new Set(MANIFEST.map((item) => item.category));

    assert.deepEqual([...categories].sort(), [
      "Add-ons",
      "Behavior Guidelines",
      "Configs",
      "Plugins",
      "Prompts",
      "Skills",
      "Workflows"
    ]);
  });

  it("includes the session bootstrap and Obsidian bridge manifests", () => {
    const ids = new Set(MANIFEST.map((item) => item.id));

    assert.ok(ids.has("config-session-bootstrap"));
    assert.ok(ids.has("prompt-session-bootstrap"));
    assert.ok(ids.has("prompt-code-style"));
    assert.ok(ids.has("prompt-meaningful-work"));
    assert.ok(ids.has("skill-obsidian-session-loop"));
    assert.ok(ids.has("plugin-obsidian-codex-bridge"));
    assert.ok(ids.has("option-obsidian-session-loop"));
  });

  it("offers optional planning counterargument and token-efficient execution skills", () => {
    const ids = new Set(MANIFEST.map((item) => item.id));

    assert.ok(ids.has("option-plan-counterargument"));
    assert.ok(ids.has("option-token-efficient-execution"));
  });

  it("includes the Hermes Tweet operator skill manifest", async () => {
    const item = MANIFEST.find((entry) => entry.id === "skill-hermes-tweet");

    assert.equal(item.category, "Skills");
    assert.equal(item.label, "hermes-tweet");
    assert.deepEqual(item.files, [
      { src: "skills/hermes-tweet/SKILL.md", dest: "skills/hermes-tweet/SKILL.md" }
    ]);
    await access(path.join(REPO_ROOT, "skills/hermes-tweet/SKILL.md"));
  });

  it("focuses installable behavior guidance on Codex", () => {
    const behaviorItems = MANIFEST.filter((item) => item.category === "Behavior Guidelines");

    assert.deepEqual(behaviorItems.map((item) => item.id), ["codex-md"]);
    assert.deepEqual(behaviorItems.flatMap((item) => item.files.map((file) => file.src)), ["CODEX.md"]);
  });

  it("points every file entry at an existing repository file", async () => {
    for (const item of MANIFEST) {
      assert.ok(item.id, "item id is required");
      assert.ok(item.label, `${item.id} label is required`);
      assert.ok(item.description, `${item.id} description is required`);
      assert.ok(item.files.length > 0, `${item.id} must install at least one file`);

      for (const file of item.files) {
        await access(path.join(REPO_ROOT, file.src));
      }
    }
  });
});
