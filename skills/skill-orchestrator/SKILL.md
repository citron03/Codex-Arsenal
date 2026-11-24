---
name: skill-orchestrator
description: Coordinate multi-step requests by discovering relevant installed skills, combining only the capabilities needed into a clear plan, executing the work, and verifying the outcome. Use for end-to-end requests spanning multiple tasks or skill areas; use a specific skill directly for a narrow task.
---

# Skill Orchestrator

Act as a router and execution controller, not a mega-skill that loads or runs everything. Preserve the user's requested outcome and compose the smallest useful set of skills, tools, and checks.

## Workflow

1. **Parse the request.** Identify the requested outcome, scope, constraints, dependencies, and observable completion criteria. Make reversible assumptions when safe. Ask only when missing information materially changes the outcome or authorization.
2. **Discover capabilities.** Inspect the current session's available skills and relevant project-local skill directories such as `.agents/skills/` and `$HOME/.agents/skills/`. In a repository that stores source skills under `skills/`, inspect that directory when useful. Read skill names and descriptions first; read full instructions only for plausible matches. Do not assume every listed or referenced skill is installed or callable.
3. **Compose the minimum set.** Choose a primary skill for the main outcome and supporting skills only for distinct subproblems (for example, planning, implementation, research, testing, or review). Explain the selection briefly when it helps the user. If no suitable skill exists, proceed with normal capabilities rather than installing or inventing one without a request.
4. **Plan proportionally.** For multi-phase work, create a short ordered plan that maps workstreams to outcomes and checks. For a simple task, skip planning ceremony and act directly. Surface dependencies or approval gates before reaching them.
5. **Execute the request.** Follow the selected skills and the project's instructions, resolving conflicts by instruction priority. Keep the work within scope; don't make external, destructive, or irreversible changes unless authorized. Revisit the plan only when evidence or a blocker warrants it.
6. **Verify independently of confidence.** Check each completion criterion with the narrowest meaningful evidence: tests, builds, diff review, source validation, or observed UI behavior. For consequential work, use a distinct review pass or reviewer when available. Do not describe the same implementation pass as an independent review.
7. **Report the result.** State what was completed, which checks actually ran, any selected skill contributions that matter, and unresolved gaps. Distinguish verified results from assumptions.

## Routing Rules

- Do not load or invoke every skill just because it exists. Skill overlap adds context and can create contradictory procedures; choose by task fit.
- A user's explicit constraints and the repository's instructions outrank skill defaults. A skill never grants permission for an external action.
- Do not turn a request for planning into permission to execute, or a request to execute into permission to publish, push, delete, spend, or modify external systems unless the user or standing instructions authorize that action.
- If the user asks for one narrow operation, route directly to its specific skill or handle it without this orchestration workflow.
- Never claim a skill, tool, reviewer, test, or external action was used unless it was actually available and used.
