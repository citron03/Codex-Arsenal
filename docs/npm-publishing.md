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

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). There is no manual version bump and no manual tag.

1. Write commits that follow [Conventional Commits](https://www.conventionalcommits.org/).
2. Merge or push to `main`.
3. The `Release` workflow analyses the new commits, decides the version, publishes to npm, and creates the matching git tag and GitHub release.

Version is derived from the commit types (Angular preset):

| Commit | Release |
| --- | --- |
| `fix:` / `perf:` | patch |
| `feat:` | minor |
| any type with `!` or a `BREAKING CHANGE:` footer | major |
| `docs:` `chore:` `ci:` `refactor:` `style:` `test:` `build:` | no release |

If a push produces no releasable commit, the workflow ends with "There are no relevant changes" and nothing is published. That is the expected outcome, not a failure.

`package.json` keeps the placeholder version `0.0.0-semantically-released`. semantic-release sets the real version in the CI workspace at publish time and does not commit it back, so the published version lives on npm and in the git tags rather than in the tracked file.

## Why Trusted Publishing

Trusted Publishing uses short-lived OIDC credentials from GitHub Actions instead of a long-lived `NPM_TOKEN`. For public packages published from public repositories, npm also creates provenance attestations automatically.
