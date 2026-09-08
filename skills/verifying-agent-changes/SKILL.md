---
name: verifying-agent-changes
description: Use when reviewing or accepting a change the agent wrote rather than the developer, and the session needs a verification step that does not depend on how confident the work felt.
---

# Verifying Agent-Written Changes

## Overview

Use this skill when most of a diff was produced by an agent and someone has to
decide whether to accept it. The problem it addresses is not that generated code
is unusually wrong. It is that the usual signal for "this is fine" — the sense of
having understood the change while writing it — was never generated, and reading
a finished diff produces a similar feeling on much thinner evidence.

Treat confidence as unavailable and replace it with checks.

## Why Impression Is Not Evidence

In a randomized controlled trial of experienced developers working on their own
repositories, allowing AI tooling increased task completion time by 19%. The same
developers estimated afterwards that it had made them 20% faster. Forecasters
with domain expertise predicted speedups near 39%. The measured direction was the
opposite of every estimate, including the estimates of the people who had just
done the work.

The magnitude is contested and tooling has moved on — see
`references/README.md` for the study and the caveats on its follow-up. The
durable part is the gap: self-assessment of AI-assisted work was wrong by about
39 percentage points, and being experienced did not protect against it.

So: do not resolve "is this change good?" by consulting how the session felt.

## Verification Order

Spend the budget where being wrong is expensive, not where reading is easy.

1. **Claims before code.** Every load-bearing statement in the change — in a
   commit message, a comment, or a summary — is a claim. Pick the ones the change
   depends on and check them directly. A plausible rule cited from memory is the
   most common defect in generated work, and it is invisible in a diff that
   otherwise looks correct.
2. **Blast radius before style.** Sort by how hard the change is to undo:
   published artifacts, deletions, destinations written to, anything that
   escapes the working tree. Formatting and naming can be fixed later; a
   published version cannot be unpublished.
3. **Behavior before tests passing.** A green suite proves the assertions that
   exist. Ask which assertion would have failed had the bug still been present —
   if none, the tests are describing the implementation rather than the
   requirement.
4. **Deletions last but hardest.** Nothing removed should be removed on the
   strength of a general rule alone. State what must be true for the removal to
   be safe, then test that statement.

## Practices

- Ask for the reproduction before the fix. A failing check written first is
  evidence; the same check written afterwards mostly confirms the code that was
  already there.
- Make the agent name what would falsify its claim. "I verified X" is not a
  verification — "running Y produced Z" is.
- Read the whole of any file the change deletes or overwrites, even when told it
  is unnecessary.
- Prefer a check that runs to a check that reasons. Diffing two real outputs
  settles a question that argument does not.
- When a claim cannot be tested cheaply, mark it as unverified in the commit
  message rather than letting it read as established.
- Be suspicious of a change that grew. Files touched beyond the request are the
  usual place where unrequested behavior enters.

## Failure Modes

- **Accepting because it is well-written.** Fluent prose and clean structure are
  the cheapest properties of generated output and carry no information about
  correctness.
- **Verifying what is easy to verify.** Running the linter on a change that
  publishes a package is motion, not verification.
- **Trusting the second answer.** A corrected claim is not more reliable for
  having been corrected; verify it on the same terms as the first.
- **Ceremony on trivial changes.** Full verification on a typo fix costs a round
  trip and buys nothing. Match the depth to the cost of being wrong.

## Worked Cases

`examples/README.md` in this repository records three, each citing a commit or
workflow run:

- a latent parser bug that shipped in a published release and was found by
  writing the reproduction first;
- a deletion that looked free under a general rule and was settled instead by
  diffing two real package builds;
- a caveat written into this repository's own documentation that was wrong, and
  was caught because it was tested rather than reasoned about.

The third is the point of the skill. The workflow that catches its own assistant
is the one worth having.
