# References

Curated links and notes for agentic development.

## Inclusion Criteria

- The source has been read, not merely bookmarked.
- The note explains why it matters.
- The material is practical for real software work.

## Template

```markdown
## Title

- URL:
- Type: paper, blog, repository, documentation, talk
- Why it matters:
- Best used when:
- Caveats:
```

---

# Agent Instructions and Behavior

## AGENTS.md

- URL: https://agents.md/
- Type: documentation
- Why it matters: This is the de facto standard file for giving coding agents project-level instructions, and it is what OpenAI Codex actually loads. The format is deliberately unopinionated — plain Markdown, no required fields — so the value is in the convention, not the schema. Resolution is proximity-based: the file nearest the edited file wins, nested files override parents, and an explicit user prompt overrides every file. That precedence order is the part worth internalizing, because it determines whether guidance in a monorepo subdirectory actually applies.
- Best used when: Deciding where project guidance should live, or working in a monorepo where different packages need different rules.
- Caveats: The convention says nothing about content quality. A file that parses fine can still be too long and too vague to change agent behavior. It also does not describe how any specific agent weighs the file against its own system prompt, so behavior varies between tools even with an identical file. Note that Codex reads `AGENTS.md` specifically: a differently-named file is not auto-loaded, however good its contents. This repository shipped its guidance as `CODEX.md` until that was found to be the case.

## Codex Best Practices

- URL: https://learn.chatgpt.com/docs/customization/overview
- Type: documentation
- Why it matters: Explains Codex's current instruction and skill layers, including user and repo scope, metadata-first skill discovery, and progressive loading of full skill instructions and supporting resources. That makes it useful for deciding what belongs in always-loaded `AGENTS.md` versus an opt-in skill.
- Best used when: Organizing project guidance or diagnosing why a skill does not activate reliably.
- Caveats: Product behavior and skill discovery locations are Codex-specific and can change. Recheck the live docs before treating this as a cross-agent convention.

## Agent Skills Specification

- URL: https://agentskills.io/specification
- Type: specification
- Why it matters: Defines the portable directory and `SKILL.md` format used by Codex and other compatible agents, including required `name` and `description` fields and their constraints.
- Best used when: Authoring or validating reusable skills.
- Caveats: The format standardizes the package shape, not discovery paths, activation quality, tool access, or runtime behavior across products.

## Codex Hooks

- URL: https://learn.chatgpt.com/docs/hooks
- Type: documentation
- Why it matters: Documents lifecycle events such as `SessionStart` and `SessionEnd`, their input/output contracts, trust review, and execution limits. A project can use automatically loaded `AGENTS.md` for simple startup guidance and reserve hooks for deterministic side effects or context injection that truly needs a command.
- Best used when: Choosing between static instructions and lifecycle automation.
- Caveats: Hook support and trust requirements vary by execution surface. `SessionEnd` output is advisory and does not make the model generate an article; validate actual behavior before relying on a hook.

## Obsidian CLI

- URL: https://obsidian.md/help/cli
- Type: documentation
- Why it matters: Official instructions for enabling the CLI shipped with Obsidian, registering it, and controlling a running vault from scripts.
- Best used when: Connecting local coding workflows to an Obsidian vault.
- Caveats: Requires a compatible Obsidian installer, user activation, and a running app for many commands. The bridge's direct Markdown file writes do not require the CLI.

## Building Effective Agents

- URL: https://www.anthropic.com/engineering/building-effective-agents
- Type: blog
- Why it matters: Draws the line between a workflow (predefined code paths) and an agent (the model directs its own process), then names the patterns in between — prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. The useful pressure it applies is downward: start with a single well-tuned call, and add structure only when you can show it improves the outcome. It also argues that the agent-tool interface deserves as much design attention as a user interface, which is the part most tool authors skip.
- Best used when: Deciding whether a task needs an autonomous loop or just a fixed sequence of steps, or designing the tools an agent will call.
- Caveats: Pattern-level, not implementation-level — you still have to build the thing. Cost and error-compounding are flagged as real risks of autonomy but not quantified, so budget for your own measurement.

# Measuring AI-Assisted Work

## Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity

- URL: https://arxiv.org/abs/2507.09089
- Type: paper
- Why it matters: A randomized controlled trial rather than a survey — 16 experienced developers, 246 real issues in repositories they already maintained, each task randomly assigned to allow or forbid AI tooling. Completion time went *up* 19% when AI was allowed. The result that survives is not the headline number but the gap beside it: the same developers estimated afterwards that AI had made them 20% faster, and economists and ML experts predicted speedups of 39% and 38% before the fact. Everyone, including the people doing the work, was wrong about the direction. That is the argument for measuring instead of asking, and for keeping a verification step that does not depend on how the session felt.
- Best used when: Deciding how much verification an AI-assisted change needs, or pushing back on a productivity claim — your own included — that rests on impression rather than measurement.
- Caveats: Narrow by construction: 16 developers, mature repositories they knew well, tooling from early 2025. It does not measure greenfield work, unfamiliar codebases, or current agentic tools, and it was never evidence that AI assistance cannot help. METR's own [February 2026 update](https://metr.org/blog/2026-02-24-uplift-update/) reports later point estimates in the opposite direction, and simultaneously warns that selection effects make that data "only very weak evidence." Read the update carefully before quoting it: it reports *speedup* as a change in completion time, so a negative number means faster — the sign is easy to invert on a first reading. Treat the perception gap as the durable finding and the magnitude as provisional.

# Context and Model Limits

## Lost in the Middle: How Language Models Use Long Contexts

- URL: https://arxiv.org/abs/2307.03172
- Type: paper
- Why it matters: Demonstrates that retrieval accuracy follows a U-shaped curve across the input — strong at the beginning and end, measurably worse in the middle. The finding holds even for models explicitly built for long contexts, which is the uncomfortable part: a larger context window does not mean uniform attention across it. The practical consequence is that position is a design variable, not an implementation detail.
- Best used when: Deciding what to put in a context window and where, or justifying why a compaction step beats simply pasting in more files.
- Caveats: Measured on multi-document QA and key-value retrieval, not on code editing, so treat the shape of the curve as the transferable result rather than the exact numbers. Published in 2023; specific models have moved on even though the positional effect has proven durable.

# Release Engineering

## Conventional Commits v1.0.0

- URL: https://www.conventionalcommits.org/en/v1.0.0/
- Type: documentation
- Why it matters: A commit-message grammar (`type[scope]: description` plus optional body and footers) that machines can read. `fix:` maps to PATCH, `feat:` to MINOR, and either a `!` before the colon or a `BREAKING CHANGE:` footer maps to MAJOR. Once release tooling consumes these, the commit type stops being a label and becomes the thing that decides what ships.
- Best used when: Setting up automated versioning, or writing commit messages in a repository that already has it.
- Caveats: The spec governs format, not honesty — nothing stops a real fix from being committed as `chore:` and silently never reaching users. The FAQ's advice to split a commit that spans several types is right and routinely ignored. Squash-merge workflows mean only the maintainer's final message has to conform.

## semantic-release

- URL: https://semantic-release.gitbook.io/semantic-release/
- Type: documentation
- Why it matters: Removes version numbers from human judgment entirely: it reads the commits since the last release, computes the next version, generates notes, tags, and publishes. The lifecycle is worth knowing by name — verify conditions, get last release, analyze commits, verify release, generate notes, create tag, prepare, publish, notify — because failures are much easier to diagnose once you can say which step broke.
- Best used when: A package is published often enough that manual versioning has become a source of mistakes.
- Caveats: Deliberately does not commit the version back to the repository, so `package.json` on disk will not match what is on the registry. That surprises people and looks like a bug the first time. It expects to run in CI on a configured release branch; running it locally needs explicit flags. Because commits drive everything, a mislabeled commit produces a wrong version with no human checkpoint to catch it.

## npm Trusted Publishing

- URL: https://docs.npmjs.com/trusted-publishers
- Type: documentation
- Why it matters: Replaces long-lived npm tokens with short-lived OIDC credentials exchanged at publish time, which removes the highest-value secret from CI. For GitHub Actions and GitLab CI it also generates provenance automatically for public packages, linking a published tarball to the commit and workflow that produced it.
- Best used when: Setting up publishing for a package, or removing an `NPM_TOKEN` from an existing pipeline.
- Caveats: The trust configuration matches on exact strings — repository, workflow filename, and environment name — and npm does not validate it when you save it, so a typo or a renamed workflow file surfaces only as a failed publish later. Cloud runners only; self-hosted runners are unsupported. Requires recent npm and Node versions. Provenance is not available on CircleCI.
