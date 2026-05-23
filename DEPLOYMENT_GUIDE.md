# Deployment Guide

Codex-Arsenal is distributed as the public npm package `codex-arsenal`.

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

4. Choose a version:

   - `npm version patch` for bug fixes and documentation-only package updates.
   - `npm version minor` for new installable items or CLI behavior.
   - `npm version major` for breaking CLI or manifest changes.

5. Push the release:

   ```bash
   git push --follow-tags
   ```

GitHub Actions publishes `v*` tags to npm through Trusted Publishing.

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
