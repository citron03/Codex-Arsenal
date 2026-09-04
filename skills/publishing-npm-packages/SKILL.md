---
name: publishing-npm-packages
description: Use when preparing, troubleshooting, or automating npm package releases, especially GitHub Actions Trusted Publishing, provenance, 2FA publish errors, version tags, npm pack checks, or npx CLI packages.
---

# Publishing npm Packages

## Overview

Publish npm packages through a verified release path. Prefer GitHub Actions Trusted Publishing with OIDC over long-lived `NPM_TOKEN` secrets.

## Release Decision

First decide who owns the version number:

- **semantic-release** derives it from Conventional Commits and publishes on every push to the release branch. Prefer this for packages that release often and already write structured commit messages.
- **Manual version tags** keep `npm version` in a human's hands. Prefer this when releases are rare, deliberate, or need to be timed by hand.

Then decide how the publish authenticates:

1. Existing package with Trusted Publishing configured: publish through OIDC.
2. First publish for a new package: create the package with npm 2FA or a short-lived/granular manual path, then configure Trusted Publishing.
3. CI provider unsupported or private dependency constraints: use a granular npm token with the narrowest publish scope.

The two decisions are independent. semantic-release publishes through Trusted Publishing without an `NPM_TOKEN`.

## Preflight

Before changing release config, inspect:

- `package.json`: `name`, `version`, `bin`, `files`, `repository.url`, `publishConfig.access`
- `package-lock.json`: present when workflow uses `npm ci`
- `.github/workflows/*.yml`: CI and publish workflow
- npm package state: `npm info <package-name>` when npm is available

For GitHub Actions Trusted Publishing, require:

```yaml
permissions:
  contents: read
  id-token: write
```

Use GitHub-hosted runners, Node 22.14+ or 24, npm 11.5.1+, and `actions/setup-node` with `registry-url: "https://registry.npmjs.org"`.

## Package Metadata

Keep npm metadata boring and exact:

```json
{
  "type": "module",
  "bin": {
    "package-name": "bin/cli.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/OWNER/REPO.git"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

Do not use `./` in `bin` paths if npm reports that it auto-corrected the script name or path. Run `npm pkg fix` when available, or apply the equivalent minimal metadata fix.

## Trusted Publishing Setup

Configure on npmjs.com after the package exists:

```text
Packages -> PACKAGE -> Settings -> Trusted publishing
Provider: GitHub Actions
Owner: GitHub owner
Repository: GitHub repository
Workflow filename: publish.yml
Environment: npm, if the workflow uses environment: npm
```

The workflow filename is only `publish.yml`, not `.github/workflows/publish.yml`.

If the workflow uses `environment: npm`, ensure GitHub has an environment named `npm`.

## Recommended Workflows

Use separate CI and publish workflows.

CI. Drop the `push` trigger when a release workflow already runs the same checks on `main`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: "24"
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm pack --dry-run
```

Publish, for the manual version-tag path. The automated path replaces this workflow; see the next section:

```yaml
name: Publish to npm
on:
  push:
    tags: ["v*"]
permissions:
  contents: read
  id-token: write
jobs:
  publish:
    runs-on: ubuntu-latest
    environment: npm
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: "24"
          registry-url: "https://registry.npmjs.org"
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm pack --dry-run
      - run: npm publish
```

## Automated Releases With semantic-release

### Install

Install the core package only:

```bash
npm install --save-dev semantic-release
```

Do not install `@semantic-release/npm`, `@semantic-release/github`, `@semantic-release/commit-analyzer`, or `@semantic-release/release-notes-generator` directly. They ship as dependencies of the core package. Installing them directly pins a version that drifts behind the core and is the most common cause of `ENONPMTOKEN` under Trusted Publishing.

semantic-release requires Node `^22.14.0 || >=24.10.0`, which is stricter than the `engines` range most packages declare for their own consumers.

### Configure

`.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github"
  ]
}
```

### Workflow

```yaml
name: Release
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
jobs:
  release:
    runs-on: ubuntu-latest
    environment: npm
    permissions:
      contents: write # git tags and GitHub releases
      issues: write # comment on released issues
      pull-requests: write # comment on released pull requests
      id-token: write # trusted publishing and provenance
    concurrency:
      group: release-${{ github.ref }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v6
        with:
          node-version: "24"
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm pack --dry-run
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`fetch-depth: 0` is required so semantic-release can read the tag history. `persist-credentials: false` is required so it pushes with its own token instead of the checkout credentials.

If the repository already publishes by tag, reuse the existing workflow **file name** and environment rather than creating a new file. The npm Trusted Publisher matches on the workflow file name, so renaming it breaks publishing until the trusted publisher is updated on npmjs.com.

### Version Mapping

Default Angular preset:

| Commit | Release |
| --- | --- |
| `fix:` / `perf:` | patch |
| `feat:` | minor |
| any type with `!` or a `BREAKING CHANGE:` footer | major |
| `docs:` `chore:` `ci:` `refactor:` `style:` `test:` `build:` | no release |

A push with no releasable commit ends with "There are no relevant changes". That is success, not failure.

### Version In package.json

semantic-release sets the version in the CI workspace at publish time and does not commit it back. Set the tracked value to a placeholder so nobody reads it as the released version:

```json
{
  "version": "0.0.0-semantically-released"
}
```

After changing it, resync the lockfile or `npm ci` fails on the mismatch:

```bash
npm install --package-lock-only
npm ci --dry-run
```

Committing `CHANGELOG.md` and the version back with `@semantic-release/changelog` and `@semantic-release/git` is possible but not recommended: it adds a release commit to the release branch on every publish.

### Preview

```bash
GITHUB_TOKEN=$(gh auth token) npx semantic-release --dry-run --no-ci
```

This fails locally at the npm auth step, because OIDC token exchange only happens inside the CI provider. To preview just the next version and the release notes, drop the npm plugin:

```bash
GITHUB_TOKEN=$(gh auth token) npx semantic-release --dry-run --no-ci \
  --plugins @semantic-release/commit-analyzer,@semantic-release/release-notes-generator,@semantic-release/github
```

Confirm the output names the expected last tag before trusting the computed version.

## Release Procedure

### Automated

1. Verify clean state: `git status --short`.
2. Run tests: `npm test`.
3. Inspect package contents: `npm pack --dry-run`.
4. Commit with the Conventional Commits type that matches the intended version.
5. Push to the release branch: `git push`.
6. Check the release job, including the case where it correctly publishes nothing.
7. Smoke test after publish: `npx <package-name> --help` or `npx <package-name> list`.

### Manual

1. Verify clean state: `git status --short`.
2. Run tests: `npm test`.
3. Inspect package contents: `npm pack --dry-run`.
4. Bump version: `npm version patch`, `minor`, or `major`.
5. Push commit and tag: `git push --follow-tags`.
6. Check GitHub Actions publish job.
7. Smoke test after publish: `npx <package-name> --help` or `npx <package-name> list`.

## Failure Handling

| Symptom | Root Cause | Response |
| --- | --- | --- |
| `E403 Two-factor authentication... required` | Manual publish without required 2FA or publish token | Enable npm 2FA and retry manual first publish, or use Trusted Publishing after package exists |
| `ENEEDAUTH` in GitHub Actions | Trusted Publisher mismatch or missing OIDC permission | Check owner, repo, workflow filename, environment name, and `id-token: write` |
| npm auto-corrects `package.json` | Metadata is publishable but not canonical | Run `npm pkg fix` or make the exact minimal metadata change |
| `npm ci` fails in CI | Missing or stale lockfile | Generate/update `package-lock.json` with the intended npm version |
| Package name unavailable | Name already exists or scope mismatch | Rename to a scoped package such as `@owner/name` and set public access |
| `ENONPMTOKEN` with Trusted Publishing configured | `@semantic-release/npm` installed directly at a version too old for OIDC, or the run is not inside a supported CI provider | Depend on `semantic-release` alone and remove the direct plugin dependencies; expect this error in local dry runs |
| semantic-release publishes nothing | No commit since the last tag maps to a release | Check the commit types; `docs:` and `chore:` are intentionally not releasable |
| semantic-release picks the wrong base version | Shallow clone, or the tag history is missing | Set `fetch-depth: 0` on checkout |
| semantic-release cannot push the tag | Checkout credentials shadow its token | Set `persist-credentials: false` on checkout and pass `GITHUB_TOKEN` to the release step |

## Guardrails

- Never publish without reading the `npm pack --dry-run` file list.
- Never add `NPM_TOKEN` when Trusted Publishing works for the project.
- Never reuse a version after a failed or partial publish; check `npm info <name> versions`.
- Never claim a package is published until npm or `npx` confirms the released version.
- Never run `npm version` or push a version tag by hand in a repository where semantic-release owns the version.
- Never rename the publish workflow file without updating the npm Trusted Publisher to match.
