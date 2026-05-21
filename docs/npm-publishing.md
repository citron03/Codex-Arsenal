# npm Publishing

This package is set up for npm Trusted Publishing from GitHub Actions.

## One-time npm setup

1. Create or claim the `codex-arsenal` package on npm.
2. On npmjs.com, open the package settings and add a Trusted Publisher:
   - Provider: GitHub Actions
   - Owner: `citron03`
   - Repository: `Codex-Arsenal`
   - Workflow filename: `publish.yml`
   - Environment: `npm`
3. After the first trusted publish works, set publishing access to require 2FA and disallow tokens.

## Release process

1. Ensure `main` is green.
2. Update the version:

   ```bash
   npm version patch
   ```

3. Push the commit and tag:

   ```bash
   git push --follow-tags
   ```

GitHub Actions will run tests, perform a package dry run, and publish to npm from the `v*` tag.

## Why Trusted Publishing

Trusted Publishing uses short-lived OIDC credentials from GitHub Actions instead of a long-lived `NPM_TOKEN`. For public packages published from public repositories, npm also creates provenance attestations automatically.
