# AGENTS.md

> Behavioral guidelines to reduce common LLM coding mistakes.  
> Codex loads this file automatically from the repository root and from nested
> directories, closest file first. Merge with project-specific instructions —
> setup commands, test commands, and repo layout — as needed.  
> **Tradeoff:** These guidelines favor correctness and focus; scale process to task risk.

---

## 1. Think Before Coding

Make reasonable assumptions when they are low-risk and reversible. Surface an
assumption or tradeoff when it could change the result; ask only when the answer
would materially affect scope, safety, or correctness.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- Stay within the requested outcome; don't add speculative features.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If the solution is much larger than expected, look for a simpler one.

> Ask yourself: *"Would a senior engineer say this is overcomplicated?"*  
> If yes — simplify.

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, **mention it — don't delete it**.

When your changes create orphans:

- Remove imports / variables / functions that **YOUR changes** made unused.
- Don't remove pre-existing dead code unless asked.

> **The test:** Every changed line should trace directly to the user's request.

---

## 4. Finish The Requested Outcome

For substantial tasks, identify what completion looks like and verify it. Use a
brief plan when work has distinct phases; skip ceremony for small edits.
Continue through implementation and appropriate verification rather than
stopping after proposing a plan or making the first change.

---

## 5. Agentic Execution (Codex-specific)

- Inspect relevant files and instructions; expand exploration only when the task needs it.
- Proceed with safe, reversible work the user requested. Pause before destructive or externally visible actions that are not clearly authorized.
- Group related safe reads and checks. Keep changes scoped and report blockers without hiding them.
- Use the confirmed workspace and avoid commands that can affect unrelated projects or data.

---

## 6. Verify Proportionally

- Run the narrowest meaningful check for the change, then broaden it when scope or risk warrants.
- Don't repeat an unchanged check without a reason; distinguish observed results from assumptions.
- Prefer focused searches and outputs, but read full context when a claim depends on it.

---

User instructions take precedence over these defaults. Follow relevant local
instructions and skills, but don't let generic process guidance replace
judgment about the current task.

## Session Context

At session start, if `.codex/session-config.json` exists, read it and the
configured session initializer, code-style note, and meaningful-work note when
present. Apply the style note to relevant code and keep its guidance subordinate
to system and user instructions. `AGENTS.md` is loaded at startup, so this is the
project's automatic bootstrap; installing a standalone prompt or skill alone is
not.

At task completion, evaluate the configured meaningful-work criteria. When
they are met and `.codex/session-config.json` enables Obsidian, draft an article
with `codex-obsidian-bridge draft` using observed changes, decisions, and checks.
Do not invent verification or claim a draft was written unless the command
confirms it. If the binary is unavailable, use the package via `npm exec` only
when the configured workflow is enabled; otherwise report that the bridge is
unavailable. Skip the article for small work or when Obsidian is disabled.
