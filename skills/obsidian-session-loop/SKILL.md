---
name: obsidian-session-loop
description: Load project session guidance and draft qualifying work summaries to Obsidian.
---

# Obsidian Session Loop

## Overview

Use this skill when a project keeps session guidance in `AGENTS.md`, stores session settings in `.codex/session-config.json`, and mirrors the working notes into an Obsidian vault.

## When To Use

- When explicitly invoked at session start; installing a skill does not run it automatically.
- When the project wants a code-style note to influence the current session.
- When the work should produce a session article in Obsidian.
- When the task touches the session bootstrap, Obsidian bridge, or the meaningful-work criteria.

## Session Startup

1. Follow applicable `AGENTS.md` instructions and load `.codex/session-config.json` when this workflow is invoked.
2. Read the configured initializer, style, and meaningful-work notes that exist.
3. Sync through `codex-obsidian-bridge` only when configured and useful; merge the style note into the current task.

## Meaningful Work Check

Treat the work as meaningful when at least two of these are true:

- the change spans multiple files in one coherent slice;
- the task adds or changes installable content, configs, or workflows;
- the work changes behavior rather than only copy;
- verification is required beyond a trivial smoke test;
- the README or user-facing guidance needs a substantive update.

Always treat new integration boundaries as meaningful, including the Obsidian bridge itself.

For long-running, multi-phase, unattended, or handoff-heavy work, use the
`decision-trail` skill to preserve important decisions and verification evidence.
At the end of the session, use that verified record as source material for the
article rather than reconstructing decisions from memory. Skip the trail for
short tasks, and do not copy private or irrelevant details into Obsidian.

## End Of Session

1. Summarize the actual change, not the file list.
2. If the meaningful-work check passes, draft an Obsidian article with the bridge CLI.
3. Include what changed, why it mattered, the tradeoffs, verification, and follow-up work.

## Guardrails

- Keep the session bootstrap short and readable.
- Prefer the configured note paths over hardcoded vault locations.
- Do not draft an article for tiny formatting-only changes.
- Do not overwrite a user’s Obsidian note unless `--force` was intentional.
