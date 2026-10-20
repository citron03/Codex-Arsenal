---
name: token-efficient-execution
description: Reduce unnecessary context and tool output while preserving useful verification.
---

# Token-Efficient Execution

Spend context only where it changes the decision.

- Start with filenames, symbols, and short snippets before reading full files.
- Prefer `rg` and targeted searches over broad recursive reads.
- Summarize long output immediately: key facts, paths, line numbers, open questions.
- Quote only the smallest useful error excerpt; do not return large logs.
- Reuse already-loaded context instead of reading the same files again.
- Batch related read-only checks when their results are needed together.
- For handoffs, compress to goal, changed files, commands run, verification, and next risk.

Context conservation never replaces verification. Read the full source when a narrow excerpt cannot establish correctness.
