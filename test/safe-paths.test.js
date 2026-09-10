import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertNotSymlink, pathExists, resolveContainedPath } from "../lib/safe-paths.js";

async function scratch() {
  return mkdtemp(join(tmpdir(), "codex-arsenal-safe-paths-"));
}

describe("resolveContainedPath", () => {
  it("resolves a plain relative path under the root", () => {
    assert.equal(resolveContainedPath("/root", "a/b.md"), join("/root", "a/b.md"));
  });

  it("allows an absolute path that is already inside the root", () => {
    assert.equal(resolveContainedPath("/root", "/root/a.md"), join("/root", "a.md"));
  });

  it("rejects a path that climbs out with ..", () => {
    assert.throws(() => resolveContainedPath("/root", "../escaped.md"), /escapes target directory/);
  });

  it("rejects the parent directory itself", () => {
    assert.throws(() => resolveContainedPath("/root", ".."), /escapes target directory/);
  });

  it("rejects an absolute path outside the root", () => {
    assert.throws(() => resolveContainedPath("/root", "/etc/passwd"), /escapes target directory/);
  });

  it("rejects a path that climbs out after descending first", () => {
    assert.throws(() => resolveContainedPath("/root", "a/../../escaped.md"), /escapes target directory/);
  });

  // A filename may legitimately begin with two dots. Matching on the string
  // prefix alone used to reject this.
  it("allows a file whose name merely starts with two dots", () => {
    assert.equal(resolveContainedPath("/root", "..hidden.md"), join("/root", "..hidden.md"));
  });

  it("uses the caller's wording in the error", () => {
    assert.throws(
      () => resolveContainedPath("/root", "../x", "Obsidian note must be inside the vault"),
      /Obsidian note must be inside the vault: \.\.\/x/
    );
  });
});

describe("pathExists", () => {
  it("reports a regular file as present", async () => {
    const root = await scratch();
    try {
      await writeFile(join(root, "a.md"), "x", "utf8");
      assert.equal(await pathExists(join(root, "a.md")), true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("reports a missing path as absent", async () => {
    const root = await scratch();
    try {
      assert.equal(await pathExists(join(root, "nope.md")), false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  // access() follows links, so a link to a missing file looked absent — and
  // writing it would have created the file the link points at.
  it("reports a link to a missing file as present", async () => {
    const root = await scratch();
    try {
      await symlink(join(root, "missing.md"), join(root, "link.md"));
      assert.equal(await pathExists(join(root, "link.md")), true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("assertNotSymlink", () => {
  it("accepts a path that does not exist", async () => {
    const root = await scratch();
    try {
      await assertNotSymlink(join(root, "new.md"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("accepts a regular file", async () => {
    const root = await scratch();
    try {
      await writeFile(join(root, "a.md"), "x", "utf8");
      await assertNotSymlink(join(root, "a.md"));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses a symbolic link", async () => {
    const root = await scratch();
    try {
      await writeFile(join(root, "real.md"), "x", "utf8");
      await symlink(join(root, "real.md"), join(root, "link.md"));
      await assert.rejects(assertNotSymlink(join(root, "link.md")), /Refusing to write through a symbolic link/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
