import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzerOptions, bumpFor, nextVersion } from "../scripts/release-preview.mjs";

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

  // The Angular preset defines no breakingHeaderPattern of its own, so `!` used
  // to release nothing at all. .releaserc.json supplies one; these assert the
  // Conventional Commits rule now holds, with and without a scope.
  it("reports a major for the ! marker", async () => {
    assert.equal(await bumpFor([commit("feat!: a breaking feature")]), "major");
    assert.equal(await bumpFor([commit("feat(scope)!: a breaking feature")]), "major");
    assert.equal(await bumpFor([commit("fix!: a breaking fix")]), "major");
  });
});

// The preview is only worth reading if it cannot disagree with the release, so
// it reads the analyzer's options from the file the Release workflow reads.
describe("release-preview: agreement with the release configuration", () => {
  it("takes the analyzer options from .releaserc.json", async () => {
    const options = await analyzerOptions();

    assert.ok(options.parserOpts?.breakingHeaderPattern, "expected the repository to configure a breaking-header pattern");
    assert.match("feat!: x", new RegExp(options.parserOpts.breakingHeaderPattern));
  });

  it("uses those options rather than the preset defaults", async () => {
    const withRepoConfig = await bumpFor([commit("feat!: a breaking feature")]);
    const withPresetDefaults = await bumpFor([commit("feat!: a breaking feature")], {});

    assert.equal(withRepoConfig, "major");
    assert.equal(withPresetDefaults, null, "the preset alone still ignores the marker; the config is what changes it");
  });
});
