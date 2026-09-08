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
- Caveats: The convention says nothing about content quality. A file that parses fine can still be too long and too vague to change agent behavior. It also does not describe how any specific agent weighs the file against its own system prompt, so behavior varies between tools even with an identical file. Note that Codex reads `AGENTS.md` specifically — a differently-named file, including this repository's `CODEX.md`, is not auto-loaded.

## Codex Best Practices

- URL: https://learn.chatgpt.com/guides/best-practices
- Type: documentation
- Why it matters: The most concrete of OpenAI's Codex guidance. It frames a task prompt as four parts — goal, context, constraints, and a "done when" condition — which maps directly onto the difference between a task an agent can close on its own and one that needs constant clarification. It is also explicit about the failure modes: overloading prompts with what belongs in `AGENTS.md`, skipping planning on multi-step work, granting broad permissions before you understand the workflow, and running an entire project through one bloated conversation.
- Best used when: Writing a task prompt for a non-trivial change, or diagnosing why an agent keeps stopping to ask questions.
- Caveats: Written for OpenAI's own products, so the specific commands and permission controls do not transfer to other agents. The advice to keep instruction files short is stated but not quantified — you have to find the ceiling empirically.

## Building Effective Agents

- URL: https://www.anthropic.com/engineering/building-effective-agents
- Type: blog
- Why it matters: Draws the line between a workflow (predefined code paths) and an agent (the model directs its own process), then names the patterns in between — prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer. The useful pressure it applies is downward: start with a single well-tuned call, and add structure only when you can show it improves the outcome. It also argues that the agent-tool interface deserves as much design attention as a user interface, which is the part most tool authors skip.
- Best used when: Deciding whether a task needs an autonomous loop or just a fixed sequence of steps, or designing the tools an agent will call.
- Caveats: Pattern-level, not implementation-level — you still have to build the thing. Cost and error-compounding are flagged as real risks of autonomy but not quantified, so budget for your own measurement.

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
