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
npx codex-arsenal get agents-md skill-publishing-npm-packages
```

Install optional planning, token-efficiency, or Obsidian support:

```bash
npx codex-arsenal get option-plan-counterargument
npx codex-arsenal get option-token-efficient-execution
npx codex-arsenal get option-obsidian-session-loop
```

Install into another directory:

```bash
npx codex-arsenal get agents-md --dir ./my-project
```

On Windows or when running from a package directory with the same name, this form is the most reliable:

```bash
npm exec --yes --package=codex-arsenal@latest --call="codex-arsenal list"
```

## CLI

```bash
codex-arsenal init [--yes] [--force] [--dir <path>]
codex-arsenal list
codex-arsenal get <id...> [--force] [--dir <path>]
codex-obsidian-bridge sync [--dir <path>] [--force]
codex-obsidian-bridge open [--dir <path>] [--file <path>]
codex-obsidian-bridge reveal [--dir <path>] [--file <path>]
codex-obsidian-bridge draft --title <text> --summary <text> [options]
```

- `init` opens a small selector. With `--yes`, it installs default items without prompting.
- `list` prints all installable manifest entries grouped by category.
- `get` installs one or more manifest entries by id.
- Existing files are skipped by default. Add `--force` to overwrite them intentionally.
- `codex-obsidian-bridge sync` mirrors the session bootstrap, code style, and meaningful-work notes into an Obsidian vault.
- `codex-obsidian-bridge open` and `reveal` launch a vault note through the configured Obsidian command, or an `obsidian://` URI when no command is configured.
- `codex-obsidian-bridge draft` writes an article draft into the configured Obsidian inbox when the meaningful-work threshold is met.

The package is published on npm as [`codex-arsenal`](https://www.npmjs.com/package/codex-arsenal).

## What Is Included

### Behavior Guidelines

| ID | Installs | Purpose |
| --- | --- | --- |
| `agents-md` | `AGENTS.md` | Project-local behavioral guardrails for Codex-style agents. |

Codex loads `AGENTS.md` automatically from the project root and from nested
directories, closest file first, so the guidance applies without being pasted
into a prompt. The previous id `codex-md` still resolves to this item.

### Configs

| ID | Installs | Purpose |
| --- | --- | --- |
| `config-codex` | `.codex/config.json` | Starter Codex config. |
| `config-session-bootstrap` | `.codex/session-config.json` | Session bootstrap and Obsidian bridge settings. |
| `config-vscode` | `.vscode/settings.json` | VS Code settings for agent-assisted development. |

### Add-ons

These are opt-in: `init --yes` installs only the default `agents-md` guidance. Select an add-on in the interactive `init` prompt or pass its ID to `get`.

| ID | Installs | Purpose |
| --- | --- | --- |
| `option-plan-counterargument` | `skills/plan-counterargument/SKILL.md` | Challenge a proposed plan and revise it when the evidence falsifies it. |
| `option-token-efficient-execution` | `skills/token-efficient-execution/SKILL.md` | Conserve context and tool-output budget without skipping verification. |
| `option-obsidian-session-loop` | Obsidian config, prompts, skill, and bridge sketch | Add session-note sync and meaningful-work article drafting in Obsidian. |

### Prompts

| ID | Installs | Purpose |
| --- | --- | --- |
| `prompt-session-bootstrap` | `prompts/session-bootstrap.md` | Session startup instructions for Codex. |
| `prompt-code-style` | `prompts/code-style.md` | Obsidian-backed code style note template. |
| `prompt-meaningful-work` | `prompts/meaningful-work.md` | Criteria and template for end-of-session articles. |
| `prompt-solo-dev` | `prompts/system-prompts/solo-dev.md` | Solo developer system prompt template. |

### Skills

| ID | Installs | Purpose |
| --- | --- | --- |
| `skill-debug-workflow` | `skills/debug-workflow/SKILL.md` | Reproduce, diagnose, test, and fix bugs systematically. |
| `skill-test-gen` | `skills/test-gen/SKILL.md` | Generate focused tests from behavior notes and function signatures. |
| `skill-publishing-npm-packages` | `skills/publishing-npm-packages/SKILL.md` | Prepare, troubleshoot, and automate npm releases with Trusted Publishing. |
| `skill-obsidian-session-loop` | `skills/obsidian-session-loop/SKILL.md` | Session startup, Obsidian sync, and end-of-session article drafting. |
| `skill-hermes-tweet` | `skills/hermes-tweet/SKILL.md` | Install, configure, and safely operate the Hermes Tweet plugin. |
| `skill-verifying-agent-changes` | `skills/verifying-agent-changes/SKILL.md` | Verify changes the agent wrote rather than you, without relying on how the session felt. |

### Plugins

| ID | Installs | Purpose |
| --- | --- | --- |
| `plugin-context-window-compressor` | `plugins/context-window-compressor/` | Plugin sketch for compressing long agent context into concise handoff notes. |
| `plugin-obsidian-codex-bridge` | `plugins/obsidian-codex-bridge/` | Plugin sketch for syncing Codex notes and article drafts with Obsidian. |

## Obsidian Bridge

The bridge is designed around two repeatable actions:

1. `sync` the session initializer and style notes into a vault so the notes stay close to where they are read.
2. `draft` a session article when the configured meaningful-work criteria are met.

The default config lives in `.codex/session-config.json` and can be customized per project. A minimal vault layout looks like this:

```text
Codex/
  Session-Initializer.md
  Code-Style.md
  Meaningful-Work.md
Inbox/
  Codex/
```

Example commands:

```bash
codex-obsidian-bridge sync --dir .
codex-obsidian-bridge open --dir . --file "Codex/Session-Initializer.md"
codex-obsidian-bridge reveal --dir . --file "Inbox/Codex/2026-06-11-refined-session-bootstrap.md"
codex-obsidian-bridge draft --dir . --title "Refined session bootstrap" --summary "Added an Obsidian bridge and session-level startup guidance." --changes "added bridge CLI, added note templates" --decisions "kept config file-based" --verification "npm test" --signals "new integration boundary, README update"
```

`.codex/session-config.json` is executable input: `obsidian.launch` names a
command the bridge runs, and the note and inbox paths decide where it writes.
Writes are confined to the vault and refuse to follow symbolic links, but the
command is not sandboxed — run the bridge only against a config you trust.

If you have an Obsidian CLI or local launcher, add `obsidian.launch.open` and `obsidian.launch.reveal` templates to `.codex/session-config.json`. The bridge will use those templates first and fall back to an `obsidian://` launch URI if no CLI template is configured.

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
  prompts/              system prompt templates and session notes
  skills/               reusable agent skills
  workflows/            repeatable agentic workflows
  references/           curated references and notes
  examples/             before/after examples
  docs/                 release notes and design rationale
  test/                 Node test suite
```

`lib/manifest.js` is the source of truth for installable items. Add new content there when you want it to appear in `codex-arsenal list` or be installable through `codex-arsenal get`.

## Design Principles

[`docs/design-principles.md`](docs/design-principles.md) records the decisions
behind the project — why it installs files rather than listing links, why
existing files are never overwritten by default, why there are no runtime
dependencies — and what each of those choices cost. Read it before proposing a
structural change. A Korean translation is at
[`docs/ko/design-principles.md`](docs/ko/design-principles.md).

## Development

Run tests:

```bash
npm test
```

Check the repository invariants:

```bash
npm run check:invariants
```

See what a branch would release:

```bash
npm run release:preview
```

It analyses the commits since the last tag with the same module and preset the
Release workflow uses, and prints the bump and next version as JSON. CI runs it
on every pull request and writes the answer into the job summary.

This enforces the consistency rules the documentation asserts: the README item
tables match `lib/manifest.js` in content and order, every manifest id fits the
column `codex-arsenal list` pads to, each skill's frontmatter `name` matches its
directory, every relative link in the Markdown resolves, and the commit-type
table states the same rules everywhere it appears. CI runs it on pull requests
and again before publishing.

Preview the npm package contents:

```bash
npm pack --dry-run
```

Try the local CLI:

```bash
node bin/cli.js list
node bin/cli.js get agents-md --dir ./tmp-install
```

## Publishing

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Every push to `main` runs the `Release` workflow, which analyses the new commits, decides the next version, publishes to npm through Trusted Publishing (OIDC, no `NPM_TOKEN`), and creates the git tag and GitHub release.

There is no manual step. Do not run `npm version` and do not push tags by hand.

The version comes from the commit messages:

| Commit | Release |
| --- | --- |
| `fix:` / `perf:` | patch |
| `feat:` | minor |
| any type with `!` or a `BREAKING CHANGE:` footer | major |
| `docs:` `chore:` `ci:` `refactor:` `style:` `test:` `build:` | no release |

Pushes with no releasable commit finish with "There are no relevant changes" and publish nothing.

`!` works because `.releaserc.json` gives the commit analyzer a
`breakingHeaderPattern`. semantic-release's default preset,
`conventional-changelog-angular`, defines none of its own, and without that
option `feat!: …` releases *nothing at all* — the marker stops the type from
matching, so it is not even read as a feature. `test/release-preview.test.js`
asserts both halves, so removing the option cannot pass unnoticed.

`package.json` tracks the placeholder version `0.0.0-semantically-released`. semantic-release sets the real version in the CI workspace at publish time and never commits it back, so the released versions live on npm, in the git tags, and in the GitHub release notes.

Preview the next release without publishing:

```bash
GITHUB_TOKEN=$(gh auth token) npx semantic-release --dry-run --no-ci \
  --plugins @semantic-release/commit-analyzer,@semantic-release/release-notes-generator,@semantic-release/github
```

See `DEPLOYMENT_GUIDE.md` and `docs/npm-publishing.md` for the full release and npm setup notes.

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

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/). The release version is computed from them, so `feat:` on a docs-only change publishes a needless minor version, and a real fix committed as `chore:` never reaches npm.

When adding a new installable item:

1. Add the files under the appropriate top-level directory.
2. Add a manifest entry in `lib/manifest.js`.
3. Add a row to the matching README table, in the same order as the manifest.
4. Run `npm run check:invariants`.
5. Run `npm test`.
6. Run `node bin/cli.js list` and confirm the item appears.
7. Run `npm pack --dry-run` and confirm the intended files are included.
8. Commit as `feat:` so the next push to `main` releases a minor version.

## License

MIT
