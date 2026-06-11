# obsidian-codex-bridge

Plugin sketch for connecting Codex sessions to an Obsidian vault.

## Goal

Make the session bootstrap, code-style note, and end-of-session article draft part of one loop instead of separate manual steps.

## Proposed Modes

- `bootstrap`: read the configured session note and merge project settings.
- `sync`: copy or mirror the latest code-style and session notes into the vault.
- `draft-article`: write a session article into the Obsidian inbox when the meaningful-work criteria are met.

## Suggested Settings

- `configs/codex/session-config.json`
- `prompts/session-bootstrap.md`
- `prompts/code-style.md`
- `prompts/meaningful-work.md`

## Obsidian CLI

If an `obsidian` command is available, the bridge can use it to open the vault, reveal the generated note, or hand off to a vault-local workflow. If the CLI is not available, keep the markdown files as the source of truth and mirror them manually.

## Practical CLI

The repository now ships a small `codex-obsidian-bridge` command that can sync the notes, open or reveal a note, and draft an article into the configured inbox.

If a project has an Obsidian CLI, configure `obsidian.launch.open` and `obsidian.launch.reveal` in `.codex/session-config.json`. Otherwise the bridge falls back to an `obsidian://` URI launch.
