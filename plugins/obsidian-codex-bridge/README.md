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

Use Obsidian's official CLI, which is included with the current Obsidian
installer. Enable **Settings → General → Command line interface**, register it
when prompted, restart the terminal, and verify with `obsidian help`. Do not
install the unrelated npm package named `obsidian-cli`. See the
[official CLI guide](https://obsidian.md/help/cli).

## Practical CLI

The repository now ships a small `codex-obsidian-bridge` command that can sync the notes, open or reveal a note, and draft an article into the configured inbox.

Configure `obsidian.launch.open` and `obsidian.launch.reveal` in
`.codex/session-config.json` to use the CLI for opening notes. The bridge falls
back to an `obsidian://` URI if no CLI command is configured. File sync and
article drafting write Markdown directly to the configured vault paths; they do
not require the CLI, but they do require a correct and trusted vault path.
