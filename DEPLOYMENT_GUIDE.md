# Deployment Guide

Codex-Arsenal is distributed as the public npm package `codex-arsenal`. Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release) and triggered by pushes to `main`.

## Release Checklist

1. Confirm the working tree is clean:

   ```bash
   git status --short
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Inspect the package:

   ```bash
   npm pack --dry-run
   ```

4. Commit with a Conventional Commits message. The type decides the version:

   - `fix:` or `perf:` for a patch release.
   - `feat:` for a minor release, including new installable items or CLI behavior.
   - `feat!:` or a `BREAKING CHANGE:` footer for a major release, such as breaking CLI or manifest changes.
   - `docs:`, `chore:`, `ci:`, `refactor:`, `style:`, `test:`, `build:` publish nothing.

5. Push to `main`:

   ```bash
   git push
   ```

The `Release` workflow runs the tests, computes the next version, publishes to npm through Trusted Publishing, and creates the git tag and GitHub release. Do not run `npm version` or push tags by hand; semantic-release owns both.

## Preview A Release

Check what the next release would be without publishing anything:

```bash
GITHUB_TOKEN=$(gh auth token) npx semantic-release --dry-run --no-ci
```

The npm plugin fails this dry run locally with `ENONPMTOKEN` because OIDC trusted publishing only works inside GitHub Actions. To preview just the version and release notes, skip that plugin:

```bash
GITHUB_TOKEN=$(gh auth token) npx semantic-release --dry-run --no-ci \
  --plugins @semantic-release/commit-analyzer,@semantic-release/release-notes-generator,@semantic-release/github
```

## Existing File Policy

The CLI skips existing files by default to protect user projects:

```bash
codex-arsenal init --yes
```

Use `--force` only when the caller explicitly wants to overwrite existing files:

```bash
codex-arsenal init --yes --force
codex-arsenal get codex-md --force
```

## Smoke Test Published Package

Use a fresh temporary directory:

```bash
npm init -y
npm install codex-arsenal@latest
./node_modules/.bin/codex-arsenal init --yes
```

Expected result:

- `CODEX.md` is created.
- Existing files are not overwritten unless `--force` is present.
