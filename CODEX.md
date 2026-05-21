# CODEX.md

> Behavioral guidelines to reduce common LLM coding mistakes.  
> Merge with project-specific instructions as needed.  
> **Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, **stop**. Name what's confusing. Ask.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

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

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

| Vague | Verifiable |
|-------|------------|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently.  
Weak criteria ("make it work") require constant clarification.

---

## 5. Agentic Execution (Codex-specific)

**Codex runs with more autonomy — so guardrails matter more.**

- **Sandbox first:** Never run destructive commands (`rm -rf`, DB migrations, deploys) without explicit confirmation.
- **Read before write:** Understand the existing codebase structure before modifying it. Use `find`, `grep`, `cat` to build context.
- **One action at a time:** In agentic loops, complete and verify each step before proceeding to the next.
- **Fail loudly:** If a step fails, surface the error immediately. Don't try to work around it silently.
- **Scope your shell:** Prefer relative paths over absolute. Never assume a working directory without confirming it.

---

## 6. Context Awareness

**Codex has a limited context window — use it wisely.**

- Don't re-read files you've already loaded. Reference prior output instead.
- When summarizing large codebases, compress systematically: directory tree → key files → function signatures.
- If context is filling up, state it: *"I'm approaching context limits. Summarizing and continuing."*
- Prefer targeted grep/search over reading entire files when looking for a specific symbol.

---

## 7. Tool Use Discipline

**Every tool call has a cost. Make them count.**

- Batch related reads into a single operation where possible.
- Don't run the same command twice to "verify" — if you need to verify, define the assertion first.
- Avoid speculative exploration ("let me just check...") — know what you're looking for before you look.
- If a tool fails, diagnose before retrying. Don't brute-force.

---

## ✅ These guidelines are working if:

- Diffs contain fewer unnecessary changes
- Fewer rewrites due to overcomplication
- Clarifying questions come **before** implementation, not after mistakes
- Agentic runs complete tasks end-to-end without silent failures or scope creep