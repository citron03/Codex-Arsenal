# Codex-Arsenal

Practical building blocks for working with OpenAI Codex.

Codex-Arsenal is not an awesome list. It is a small, installable collection of Codex guidelines, skills, prompts, workflows, configs, and plugin sketches that can be copied into real projects.

## Install

Run the CLI without installing it globally:

```bash
npx codex-arsenal list
```

Install the default item set into the current project:

```bash
npx codex-arsenal init --yes
```

Install specific items:

```bash
npx codex-arsenal get codex-md skill-publishing-npm-packages
```

Install into another directory:

```bash
npx codex-arsenal get codex-md --dir ./my-project
```

On Windows or when running from a package directory with the same name, this form is the most reliable:

```bash
npm exec --yes --package=codex-arsenal -- codex-arsenal list
```

## CLI

```bash
codex-arsenal init [--yes] [--force] [--dir <path>]
codex-arsenal list
codex-arsenal get <id...> [--force] [--dir <path>]
```

- `init` opens a small selector. With `--yes`, it installs default items without prompting.
- `list` prints all installable manifest entries grouped by category.
- `get` installs one or more manifest entries by id.
- Existing files are skipped by default. Add `--force` to overwrite them intentionally.

The package is published on npm as [`codex-arsenal`](https://www.npmjs.com/package/codex-arsenal).

## What Is Included

### Behavior Guidelines

| ID | Installs | Purpose |
| --- | --- | --- |
| `codex-md` | `CODEX.md` | Project-local behavioral guardrails for Codex-style agents. |

### Configs

| ID | Installs | Purpose |
| --- | --- | --- |
| `config-codex` | `.codex/config.json` | Starter Codex config. |
| `config-vscode` | `.vscode/settings.json` | VS Code settings for agent-assisted development. |

### Prompts

| ID | Installs | Purpose |
| --- | --- | --- |
| `prompt-solo-dev` | `prompts/system-prompts/solo-dev.md` | Solo developer system prompt template. |

### Skills

| ID | Installs | Purpose |
| --- | --- | --- |
| `skill-debug-workflow` | `skills/debug-workflow/` | Reproduce, diagnose, test, and fix bugs systematically. |
| `skill-test-gen` | `skills/test-gen/` | Generate focused tests from behavior notes and function signatures. |
| `skill-publishing-npm-packages` | `skills/publishing-npm-packages/SKILL.md` | Prepare, troubleshoot, and automate npm releases with Trusted Publishing. |

### Plugins

| ID | Installs | Purpose |
| --- | --- | --- |
| `plugin-context-window-compressor` | `plugins/context-window-compressor/` | Plugin sketch for compressing long agent context into concise handoff notes. |

### Workflows

| ID | Installs | Purpose |
| --- | --- | --- |
| `workflow-solo-dev-loop` | `workflows/solo-dev-loop/` | A plan, code, test, commit loop for solo developers using agents. |

## Repository Layout

```text
codex-arsenal/
  bin/                  CLI entrypoint
  lib/                  manifest, installer, and fetcher
  configs/              reusable editor and agent configs
  plugins/              plugin sketches
  prompts/              system prompt templates
  skills/               reusable agent skills
  workflows/            repeatable agentic workflows
  references/           curated references and notes
  examples/             before/after examples
  test/                 Node test suite
```

`lib/manifest.js` is the source of truth for installable items. Add new content there when you want it to appear in `codex-arsenal list` or be installable through `codex-arsenal get`.

## Development

Run tests:

```bash
npm test
```

Preview the npm package contents:

```bash
npm pack --dry-run
```

Try the local CLI:

```bash
node bin/cli.js list
node bin/cli.js get codex-md --dir ./tmp-install
```

## Publishing

This repository is configured for npm Trusted Publishing through GitHub Actions.

Release flow:

```bash
npm test
npm pack --dry-run
npm version patch
git push --follow-tags
```

Use `minor` instead of `patch` when adding new installable content or CLI behavior:

```bash
npm version minor
git push --follow-tags
```

The publish workflow runs on `v*` tags and publishes with OIDC, so it does not require a long-lived `NPM_TOKEN`.

## Codex Plugin Distribution

The npm package is the current public distribution channel. Codex plugin library publishing is separate from npm and currently does not expose a general public submission flow in the public docs.

For now, use one of these paths:

- publish reusable files through `codex-arsenal` on npm;
- keep plugin sketches under `plugins/`;
- create a local or team marketplace file at `.agents/plugins/marketplace.json` when you want Codex app users to install a repo plugin from a local marketplace;
- track OpenAI's Codex plugin documentation for an official public marketplace submission path.

See `docs/codex-plugin-distribution.md` for the current assessment.

## Contribution Guidelines

Good additions should be:

- useful in real projects, not just demos;
- small enough to understand quickly;
- documented with setup and usage notes;
- installable through the manifest when appropriate;
- verified with tests or a concrete manual check.

When adding a new installable item:

1. Add the files under the appropriate top-level directory.
2. Add a manifest entry in `lib/manifest.js`.
3. Run `npm test`.
4. Run `node bin/cli.js list` and confirm the item appears.
5. Run `npm pack --dry-run` and confirm the intended files are included.

## License

MIT
