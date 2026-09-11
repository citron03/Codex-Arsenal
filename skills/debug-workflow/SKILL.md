---
name: debug-workflow
description: Use when a Codex session is diagnosing a bug and the project wants the failure reproduced and pinned by a test before any production code changes.
---

# Debug Workflow

Do not patch first. A fix written before the failure is reproduced is a guess
that happened to compile.

1. **Reproduce** the symptom with the smallest command or test that shows it.
2. **Capture** the actual output, not a description of it.
3. **Locate** the boundary where observed behaviour first diverges from expected.
4. **Pin** it with a regression test that fails for the right reason.
5. **Fix** it with the smallest change that makes that test pass.
6. **Verify** by re-running the regression test and the nearest relevant suite.

Before touching production code, state three things: the observed behaviour, the
expected behaviour, and the narrowest boundary you suspect. If you cannot state
the boundary, you are still at step 3.

A regression test written after the fix mostly confirms the code already in
front of you. Written first, it is evidence. The difference shows up when the
bug returns.

Keep this proportional. A typo with an obvious cause does not need six steps.
The order matters most when the cause is not yet known — which is also when it
is most tempting to skip.
