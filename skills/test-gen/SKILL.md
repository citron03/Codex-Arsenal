---
name: test-gen
description: Use when a Codex session needs tests written from behaviour notes and function signatures rather than from the implementation in front of it.
---

# Test Gen

Write tests from the behaviour a caller can rely on, not from the code that
currently provides it. Where the order is available, write them first.

## Inputs

- The function or module path.
- The behaviour it is expected to have.
- The edge cases worth preserving.

## Output

- Tests that exercise real code. Substitute a dependency only when it is
  external, slow, or nondeterministic.
- One behaviour per test, named for the behaviour rather than the function.
- Assertions that describe what the caller is promised, not how the code
  happens to deliver it today.

## The check that matters

Ask which assertion would fail if the behaviour regressed. If none would, the
test is describing the implementation: it will pass for as long as the code
stays the same and tell you nothing when it changes.

The same question applies to a suite that is already green. A passing test
proves only the assertions that exist, so coverage of a bug means there is a
test that would have caught it, not that the file was touched.
