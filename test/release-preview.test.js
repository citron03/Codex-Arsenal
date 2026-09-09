import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { bumpFor, nextVersion } from "../scripts/release-preview.mjs";

function commit(message) {
  return { hash: "a".repeat(40), message };
}

describe("release-preview: version arithmetic", () => {
  it("bumps the patch position and nothing else", () => {
    assert.equal(nextVersion("v1.2.3", "patch"), "1.2.4");
  });

  it("bumps the minor position and resets the patch", () => {
    assert.equal(nextVersion("v1.2.3", "minor"), "1.3.0");
  });

  it("bumps the major position and resets the rest", () => {
    assert.equal(nextVersion("v0.8.0", "major"), "1.0.0");
  });

  it("starts from 0.0.0 when the repository has no release tag", () => {
    assert.equal(nextVersion(null, "minor"), "0.1.0");
  });

  it("returns null for a tag it cannot read as a version", () => {
    assert.equal(nextVersion("release-candidate", "patch"), null);
  });
});

// These pin what the configured preset actually decides. semantic-release
// defaults to conventional-changelog-angular, and the preview is only useful if
// it agrees with it — including where the preset surprises people.
describe("release-preview: bump for a set of commits", () => {
  it("reports no release for docs and chore commits", async () => {
    assert.equal(await bumpFor([commit("docs: a note"), commit("chore: tidy")]), null);
  });

  it("reports a patch for fix and perf", async () => {
    assert.equal(await bumpFor([commit("fix: a bug")]), "patch");
    assert.equal(await bumpFor([commit("perf: quicker")]), "patch");
  });

  it("reports a minor for feat", async () => {
    assert.equal(await bumpFor([commit("feat: a feature")]), "minor");
  });

  it("takes the highest bump across a mixed set", async () => {
    assert.equal(await bumpFor([commit("fix: a bug"), commit("feat: a feature")]), "minor");
  });

  it("reports a major for a BREAKING CHANGE footer", async () => {
    assert.equal(await bumpFor([commit("fix: a bug\n\nBREAKING CHANGE: the api moved")]), "major");
  });

  // The Angular preset defines no breakingHeaderPattern, so `!` is not read as
  // breaking — and because the marker also stops the type from matching, such a
  // commit releases nothing at all rather than releasing a major. Asserted so a
  // preset change cannot alter it silently, and documented in README.md.
  it("reports no release at all for the ! marker, which is not the Conventional Commits rule", async () => {
    assert.equal(await bumpFor([commit("feat!: a breaking feature")]), null);
    assert.equal(await bumpFor([commit("feat(scope)!: a breaking feature")]), null);
  });
});
