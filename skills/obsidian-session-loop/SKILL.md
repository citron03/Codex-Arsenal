---
name: obsidian-session-loop
description: Use when starting or ending a Codex session that should read project-local session notes, sync Obsidian-backed style guidance, and draft an article when the work is meaningful.
---

# Obsidian Session Loop

## Overview

Use this skill when a project keeps session guidance in `CODEX.md`, stores session settings in `.codex/session-config.json`, and mirrors the working notes into an Obsidian vault.

## When To Use

- At the start of a Codex session for this repository.
- When the project wants a code-style note to influence the current session.
- When the work should produce a session article in Obsidian.
- When the task touches the session bootstrap, Obsidian bridge, or the meaningful-work criteria.

## Session Startup

1. Read `CODEX.md` first.
2. Load `.codex/session-config.json` if it exists.
3. Read the configured session initializer, code-style note, and meaningful-work note.
4. Sync the notes into Obsidian if `codex-obsidian-bridge` is available.
5. Merge the code-style note into the current working style before editing files.

## Meaningful Work Check

Treat the work as meaningful when at least two of these are true:

- the change spans multiple files in one coherent slice;
- the task adds or changes installable content, configs, or workflows;
- the work changes behavior rather than only copy;
- verification is required beyond a trivial smoke test;
- the README or user-facing guidance needs a substantive update.

Always treat new integration boundaries as meaningful, including the Obsidian bridge itself.

## End Of Session

1. Summarize the actual change, not the file list.
2. If the meaningful-work check passes, draft an Obsidian article with the bridge CLI.
3. Include what changed, why it mattered, the tradeoffs, verification, and follow-up work.

## Guardrails

- Keep the session bootstrap short and readable.
- Prefer the configured note paths over hardcoded vault locations.
- Do not draft an article for tiny formatting-only changes.
- Do not overwrite a user’s Obsidian note unless `--force` was intentional.
