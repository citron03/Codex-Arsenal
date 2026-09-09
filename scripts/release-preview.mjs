#!/usr/bin/env node
// Reports the version a branch would release, so the decision principle 8 hands
// to the commit message has a checkpoint before merge.
//
// This runs the analyzer directly rather than `semantic-release --dry-run`. The
// full pipeline refuses to answer on a pull request by design: it takes the
// branch from the CI environment rather than from git, and `isBranchUpToDate`
// requires HEAD to be the remote release branch's exact tip, which a pull
// request head never is. Those are publishing guards, not analysis ones.
//
// Agreement with the Release workflow is by construction, not by imitation: the
// commits are built with git-log-parser and analysed with
// @semantic-release/commit-analyzer — the same modules, in the same order, that
// semantic-release itself uses.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { analyzeCommits } from "@semantic-release/commit-analyzer";
import { fields as gitLogFields, parse as parseGitLog } from "git-log-parser";

// semantic-release configures these shared fields at import time; without them
// git-log-parser emits no `message` at all and every commit analyses as no
// release. Same assignment, same values.
Object.assign(gitLogFields, {
  hash: "H",
  message: "B",
  gitTags: "d",
  committerDate: { key: "ci", type: Date }
});

const execFileAsync = promisify(execFile);
const BUMPS = { major: 0, minor: 1, patch: 2 };

async function git(...args) {
  const { stdout } = await execFileAsync("git", args);
  return stdout.trim();
}

export async function lastReleaseTag() {
  const tags = await git("tag", "--list", "v*", "--sort=-v:refname");
  return tags.split("\n").filter(Boolean)[0] ?? null;
}

// Mirrors semantic-release's getCommits: same parser, same field trimming.
export async function commitsSince(tag) {
  const range = `${tag ? `${tag}..` : ""}HEAD`;
  // git-log-parser returns an old-style duplex stream, not an async iterable.
  const parsed = await new Promise((resolve, reject) => {
    const collected = [];
    parseGitLog({ _: range })
      .on("data", (commit) => collected.push(commit))
      .on("error", reject)
      .on("end", () => resolve(collected));
  });

  return parsed.map(({ message, gitTags, ...commit }) => ({
    ...commit,
    message: (message ?? "").trim(),
    gitTags: (gitTags ?? "").trim()
  }));
}

export function nextVersion(tag, bump) {
  const parts = (tag ?? "v0.0.0").replace(/^v/, "").split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  const index = BUMPS[bump];
  parts[index] += 1;
  for (let after = index + 1; after < 3; after += 1) {
    parts[after] = 0;
  }
  return parts.join(".");
}

// Exposed so the suite can assert what the configured preset actually does,
// which is not always what Conventional Commits leads people to expect.
export async function bumpFor(commits) {
  return analyzeCommits({}, { commits, logger: { log() {} }, cwd: process.cwd() });
}

export async function computePreview() {
  const tag = await lastReleaseTag();
  const commits = await commitsSince(tag);
  const bump = await bumpFor(commits);

  return {
    lastRelease: tag,
    commitsAnalysed: commits.length,
    bump,
    nextVersion: bump ? nextVersion(tag, bump) : null
  };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const summary = await computePreview();

  if (summary.bump && !summary.nextVersion) {
    console.error(`Could not derive a version from the last tag ${summary.lastRelease}.`);
    process.exit(1);
  }

  console.log(JSON.stringify(summary, null, 2));
}
