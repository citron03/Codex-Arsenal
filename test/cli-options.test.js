import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readListOption, readOption } from "../lib/cli-options.js";

describe("cli options", () => {
  it("reads the value that follows an option", () => {
    assert.equal(readOption(["--dir", "./project"], "--dir"), "./project");
  });

  it("falls back when the option is absent", () => {
    assert.equal(readOption(["--force"], "--dir", "."), ".");
  });

  it("does not consume the next flag as a value", () => {
    const args = ["--title", "--summary", "the real summary"];

    assert.equal(readOption(args, "--title", "Codex Session Article"), "Codex Session Article");
    assert.equal(readOption(args, "--summary"), "the real summary");
  });

  it("falls back when the option is last and has no value", () => {
    assert.equal(readOption(["get", "--dir"], "--dir", "."), ".");
  });

  it("splits list options and drops blank entries", () => {
    assert.deepEqual(readListOption(["--changes", "added bridge, , added notes"], "--changes"), [
      "added bridge",
      "added notes"
    ]);
  });

  it("returns an empty list when a list option has no value", () => {
    assert.deepEqual(readListOption(["--changes", "--signals", "a,b"], "--changes"), []);
  });
});
