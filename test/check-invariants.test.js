import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkIdsFitTheListColumn,
  checkReadmeMatchesManifest,
  checkRelativeLinksResolve,
  checkSkillNamesMatchDirectories
} from "../scripts/check-invariants.mjs";

// A checker that cannot fail is indistinguishable from a checker that works, so
// every case below violates one invariant and asserts the report names it.
async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), "codex-arsenal-invariants-"));
  for (const [relative, contents] of Object.entries(files)) {
    const destination = join(root, relative);
    await mkdir(join(destination, ".."), { recursive: true });
    await writeFile(destination, contents, "utf8");
  }
  return root;
}

function readme(rows) {
  return ["# Fixture", "", "### Skills", "", "| ID | Purpose |", "| --- | --- |", ...rows, ""].join("\n");
}

const SKILLS = [
  { id: "skill-alpha", category: "Skills" },
  { id: "skill-beta", category: "Skills" }
];

describe("check-invariants: README matches the manifest", () => {
  it("passes when the tables agree in content and order", async () => {
    const root = await fixture({
      "README.md": readme(["| `skill-alpha` | a |", "| `skill-beta` | b |"])
    });

    try {
      const { failures } = await checkReadmeMatchesManifest(root, SKILLS);
      assert.deepEqual(failures, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the README lists the same items in a different order", async () => {
    const root = await fixture({
      "README.md": readme(["| `skill-beta` | b |", "| `skill-alpha` | a |"])
    });

    try {
      const { failures } = await checkReadmeMatchesManifest(root, SKILLS);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /"Skills" table does not match the manifest/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when a manifest item has no README row", async () => {
    const root = await fixture({ "README.md": readme(["| `skill-alpha` | a |"]) });

    try {
      const { failures } = await checkReadmeMatchesManifest(root, SKILLS);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /skill-beta/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the README has no table for a declared category", async () => {
    const root = await fixture({ "README.md": "# Fixture\n" });

    try {
      const { failures } = await checkReadmeMatchesManifest(root, SKILLS);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /no "### Skills" table/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("ignores tables that are not inside a category heading", async () => {
    const root = await fixture({
      "README.md": [
        readme(["| `skill-alpha` | a |", "| `skill-beta` | b |"]),
        "## Publishing",
        "",
        "| Commit | Release |",
        "| --- | --- |",
        "| `chore` | none |",
        ""
      ].join("\n")
    });

    try {
      const { failures } = await checkReadmeMatchesManifest(root, SKILLS);
      assert.deepEqual(failures, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("check-invariants: ids fit the list column", () => {
  it("passes when every id is within the column", () => {
    const { failures } = checkIdsFitTheListColumn(SKILLS, 32);
    assert.deepEqual(failures, []);
  });

  it("fails on an id wider than the column and reports both widths", () => {
    const { failures } = checkIdsFitTheListColumn([{ id: "x".repeat(33) }], 32);
    assert.equal(failures.length, 1);
    assert.match(failures[0], /is 33 characters; the list column is 32/);
  });

  it("accepts an id exactly at the column width", () => {
    const { failures } = checkIdsFitTheListColumn([{ id: "x".repeat(32) }], 32);
    assert.deepEqual(failures, []);
  });
});

describe("check-invariants: skill names match directories", () => {
  it("passes when frontmatter agrees with the directory", async () => {
    const root = await fixture({ "skills/alpha/SKILL.md": "---\nname: alpha\n---\n" });

    try {
      const { failures } = await checkSkillNamesMatchDirectories(root);
      assert.deepEqual(failures, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when the frontmatter name drifts from the directory", async () => {
    const root = await fixture({ "skills/alpha/SKILL.md": "---\nname: renamed\n---\n" });

    try {
      const { failures } = await checkSkillNamesMatchDirectories(root);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /declares name "renamed"/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails when frontmatter has no name at all", async () => {
    const root = await fixture({ "skills/alpha/SKILL.md": "---\ndescription: x\n---\n" });

    try {
      const { failures } = await checkSkillNamesMatchDirectories(root);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /has no "name:"/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("skips skill directories that ship no SKILL.md", async () => {
    const root = await fixture({ "skills/legacy/README.md": "# legacy\n" });

    try {
      const { failures, detail } = await checkSkillNamesMatchDirectories(root);
      assert.deepEqual(failures, []);
      assert.match(detail, /0 SKILL\.md/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("check-invariants: relative links resolve", () => {
  it("passes for a link to a file that exists", async () => {
    const root = await fixture({ "a.md": "[b](./b.md)\n", "b.md": "# b\n" });

    try {
      const { failures } = await checkRelativeLinksResolve(root);
      assert.deepEqual(failures, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails for a link to a file that does not exist", async () => {
    const root = await fixture({ "a.md": "[gone](./gone.md)\n" });

    try {
      const { failures } = await checkRelativeLinksResolve(root);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /links to ".\/gone.md", which does not exist/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("checks a link that carries a title rather than skipping it", async () => {
    const root = await fixture({ "a.md": '[gone](./gone.md "Title")\n' });

    try {
      const { failures } = await checkRelativeLinksResolve(root);
      assert.equal(failures.length, 1);
      assert.match(failures[0], /\.\/gone\.md/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("resolves a link that carries an anchor", async () => {
    const root = await fixture({ "a.md": "[b](./b.md#section)\n", "b.md": "# b\n" });

    try {
      const { failures } = await checkRelativeLinksResolve(root);
      assert.deepEqual(failures, []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("ignores absolute and anchor-only links", async () => {
    const root = await fixture({
      "a.md": "[x](https://example.test/none) [y](#local) [z](mailto:a@b.test)\n"
    });

    try {
      const { failures, detail } = await checkRelativeLinksResolve(root);
      assert.deepEqual(failures, []);
      assert.match(detail, /0 relative link/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
