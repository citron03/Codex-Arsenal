---
name: create-verification-skill
description: Use when a project needs a repository-specific skill that launches its real application, exercises user-facing behavior, and captures evidence beyond unit tests.
---

# Create a Project Verification Skill

Generate a project-local `.agents/skills/verify-<project>/SKILL.md` from facts found in the repository. The generated skill is for a future agent who has not seen this session; it must contain working commands and real paths, not TODOs or guessed setup.

## 1. Inspect the project

Read the README, package/build scripts, application entry points, existing tests, and local agent instructions. Determine:

- **Surface:** what users operate (web UI, CLI/TUI, API, desktop, or mobile).
- **Launch:** the documented command, required environment, test data, and readiness signal.
- **Drive:** the existing supported harness first (for example Playwright, a PTY, or HTTP); prefer stable selectors and real user paths.
- **Observe:** which outputs prove behavior (visible state, exit status, response, persisted data, logs, or screenshots).
- **Isolation:** whether a separate process/profile/data directory is safe. If not, say so and do not disturb a shared user session.
- **Cleanup:** exactly how to stop processes and remove only test-created state.

Do not ask the user for facts available in the repository. If the app cannot currently start, report that blocker rather than writing fictional verification instructions.

## 2. Write a focused skill

Create `.agents/skills/verify-<project>/SKILL.md` with valid Codex skill frontmatter (`name: verify-<project>` and a useful `description`). Include concrete sections for launch/readiness, a read-only health check, driving the real user flow, evidence to capture, isolation, and cleanup. State the exact commands and expected observable outcomes. Distinguish what scripted tests prove from what they do not prove.

Add a small `features/README.md` map for the three to five most important user-facing features only when the repository exposes enough evidence to identify them. For each feature, record the user path, the harness action, the observable success condition, and a genuine gotcha. Do not invent coverage or claim exhaustive verification.

Keep the output inside the target repository. Never overwrite existing guidance; inspect it and ask before replacing or merging conflicting content.

## 3. Execute and maintain

Run the generated instructions end to end for one mapped feature. Capture the real result, clean up what this run created, and confirm the evidence remains available. Fix inaccurate instructions and repeat the check. If this cannot be run safely or the app is unavailable, label the skill a draft and state the missing prerequisite.

When application behavior or its test harness changes, update the affected feature entry in the same change. Keep the map concise and verify every documented command before claiming it works.
