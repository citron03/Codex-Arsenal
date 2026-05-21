---
name: publishing-npm-packages
description: Use when preparing, troubleshooting, or automating npm package releases, especially GitHub Actions Trusted Publishing, provenance, 2FA publish errors, version tags, npm pack checks, or npx CLI packages.
---

# Publishing npm Packages

## Overview

Publish npm packages through a verified release path. Prefer GitHub Actions Trusted Publishing with OIDC over long-lived `NPM_TOKEN` secrets.

## Release Decision

Use this order:

1. Existing package with Trusted Publishing configured: release by version tag.
2. First publish for a new package: create the package with npm 2FA or a short-lived/granular manual path, then configure Trusted Publishing.
3. CI provider unsupported or private dependency constraints: use a granular npm token with the narrowest publish scope.

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

CI:

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

Publish:

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

## Release Procedure

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

## Guardrails

- Never publish without reading the `npm pack --dry-run` file list.
- Never add `NPM_TOKEN` when Trusted Publishing works for the project.
- Never reuse a version after a failed or partial publish; check `npm info <name> versions`.
- Never claim a package is published until npm or `npx` confirms the released version.
