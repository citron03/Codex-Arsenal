# Session Bootstrap

The project's `AGENTS.md` points to this note so Codex reads it at session
startup. When used alone, this prompt is not loaded automatically; reference it
from `AGENTS.md` or explicitly invoke the session workflow.

## Startup Order

1. Read `.codex/session-config.json` if it exists; otherwise use another path only when the project documents it.
2. Load the configured session initializer, code style note, and meaningful-work note.
3. Merge the current task with the project-specific style guidance.
4. Check whether Obsidian integration is available before drafting session notes.
5. Sync notes only when the bridge is configured and syncing is relevant; do not delay unrelated work for an optional integration.

## What This Session Needs

- Keep a short, explicit summary of the current goal.
- Keep the active assumptions visible.
- Prefer the simplest change that still satisfies the task.
- Treat the configured code-style note as the source of truth for formatting and tone.

## End-of-Session Rule

If the current work satisfies the meaningful-work criteria, create a draft article in the configured Obsidian inbox and summarize the result there.
