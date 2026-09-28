---
name: change-impact-analysis
description: Use before shipping a change that crosses shared APIs, persisted data, external integrations, or multiple consumers, or when asked what a change could break.
---

# Change Impact Analysis

Use this for consequential changes, not every small diff. The goal is to identify plausible regressions outside the edited lines and verify the important safety assumptions with the cheapest meaningful evidence.

## Method

1. **Bound the change.** Read the diff and identify changed contracts: exported APIs, data formats, state transitions, configuration, persistence, security boundaries, and side effects.
2. **Trace consumers.** Find direct callers and likely indirect consumers: other modules, tests, CLI commands, scripts, stored data, external services, and documentation/configuration users. Follow a contract across layers when the repository shows that it crosses them.
3. **Select real risks.** For each plausible break, state the trigger, affected consumer, and impact. Separate confirmed risks from possibilities; do not pad the list with generic concerns.
4. **Find the critical assumption.** Identify the one or two facts the change is safe only if true. Prefer executing the actual code or a focused test over arguing from the diff. Use repository evidence and give paths/line numbers for claims.
5. **Verify proportionally.** Run the narrowest test or reproducible check that exercises the changed contract. Expand to broader checks when the impact crosses modules or the focused result leaves an important path untested.
6. **Report honestly.** Summarize the change, affected consumers, confirmed risks, checks run and outcomes, and anything still unverified. Never present a search with no matches as proof that no consumer exists.

Do not create a report or test harness for a trivial, local change. Do not modify unrelated code to eliminate hypothetical risks. If an important safety claim cannot be tested, mark it unverified and explain the limitation.
