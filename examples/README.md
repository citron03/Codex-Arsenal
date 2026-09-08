# Examples

Before-and-after examples that show how Codex-Arsenal material changes a real workflow.

## Example Format

- Context: what the project or task looked like.
- Input: prompt, config, skill, or workflow used.
- Output: what changed.
- Verification: how the improvement was checked.
- Caveats: where this approach is a poor fit.

Every example below is drawn from work on this repository and cites a commit,
pull request, or release you can inspect.

---

## Turning "fix the option parser" into a verifiable goal

- Context: Both CLI binaries parsed flags with `readOption`, which returned `args[index + 1]` unconditionally. An option given without a value silently swallowed the next flag, so `draft --title --summary "..."` produced an article titled `--summary`. The obvious instruction — "fix the option parser" — has no completion condition, so an agent can edit the function, see no error, and declare it done.
- Input: `AGENTS.md` §4 Goal-Driven Execution, which converts a vague task into an assertion written *before* the change: "Write a test that reproduces it, then make it pass."
- Output: The bug was first reproduced as a standalone comparison of the old and new parser against the same argv, then fixed. Because the assertion had to be written first, the duplicated parser in both binaries was extracted to `lib/cli-options.js` where it could be unit tested — a change that would not have been motivated by the fix alone. Six unit tests now pin the behavior, including the case where an option is the last token.
- Verification: `npm test` went from 21 to 31 passing. The reproduction is legible on its own:

  ```
  args = [--title --summary "the real summary"]
  before: --title => "--summary"
  after:  --title => undefined     # falls back to the default title
  ```

  Confirmed end to end against the published package, not just the local build:
  `npm exec --package=codex-arsenal@0.7.3 --call="codex-obsidian-bridge draft --title --summary 'x' ..."`
  writes the default-titled note. See commit `5c5136b`.
- Caveats: Writing the assertion first costs a round trip that a genuinely trivial change does not repay. The extraction to `lib/` was justified here because the parser was already duplicated; doing it for a single-use function would contradict `AGENTS.md` §2.

## Verifying a deletion instead of assuming one

- Context: The repository carried both an `.npmignore` and a `files` allowlist in `package.json`. The common knowledge that `files` takes precedence makes `.npmignore` look like obvious dead weight, and deleting it looks like a free cleanup.
- Input: `AGENTS.md` §3 Surgical Changes ("if you notice unrelated dead code, mention it — don't delete it") and §6 Tool Use Discipline ("if you need to verify, define the assertion first").
- Output: Instead of deleting on the strength of the general rule, the assertion was stated first — *the tarball must be identical with and without the file* — and then tested by packing both ways and diffing the file lists. The diff was empty, which turned a plausible assumption into evidence, and that evidence went into the commit message rather than being discarded.
- Verification: `npm pack --dry-run --json` with and without the file produced identical path lists. See commit `0b56b53`.
- Caveats: This is worth doing when the deletion affects what ships to users. Applying the same ceremony to every unused import would be pure overhead. One further note, which was itself only settled by testing: the follow-up assumption that `.npmignore` can still exclude files *inside* a directory listed in `files` is also false on npm 10.9.2 — no pattern form tried had any effect. That is an observation about one packer version rather than a guarantee, which is precisely why the original check was a pack diff instead of an appeal to the rule.

## Reading a successful publish that looks like a failure

- Context: A release is published by pushing to `main`; semantic-release computes the version and publishes through Trusted Publishing. Immediately after a green workflow run, `npm view codex-arsenal version` still reported the *previous* version, and `npm view codex-arsenal@0.7.3` returned `E404`. Read naively, that is a failed publish, and the tempting responses — re-running the release, or hand-publishing — are both wrong and one of them is destructive.
- Input: `skills/publishing-npm-packages/SKILL.md`, which documents post-publish registry propagation and the `E404`/`ETARGET` window that follows a successful publish.
- Output: The workflow log was checked before the registry was trusted. It contained npm's own notice that the package was still being processed, alongside a signed provenance statement and a published GitHub release — three independent signals that the publish had succeeded. The correct action was to poll rather than to retry.
- Verification: Publish completed at 05:41:28 UTC (run [34014592295](https://github.com/citron03/Codex-Arsenal/actions/runs/34014592295)). A cache-busted `curl` against `registry.npmjs.org` still omitted `0.7.3` on the first two polls and returned it on the third, roughly 90 seconds after publish. `npm view codex-arsenal version` then reported `0.7.3`.
- Caveats: The delay is not a fixed interval, so treat ~90 seconds as an observation and not a timeout to hard-code. This heuristic only applies when the workflow itself succeeded — a genuinely failed publish also produces a 404, and the difference is visible only in the logs. Do not use propagation as a blanket explanation for a missing version.
