---
name: decision-trail
description: Use for long-running, multi-phase, unattended, or handoff-heavy work where a reviewer needs a concise record of decisions and evidence.
---

# Decision Trail

Keep a small, append-only decision log for consequential work. This is not a transcript or an activity log: record only choices, pivots, completed checkpoints, blockers, and verification results that would help a reviewer understand or resume the work.

## Location and format

Use `.audit/<task-slug>.tsv` in the project when work spans phases or agents; use a temporary work-directory `decisions.tsv` for a single long task. Do not commit the log unless the user or project explicitly needs a durable audit artifact. Never put credentials, private user data, or full prompts in it.

Use this header and keep every cell on one line:

```tsv
timestamp	phase	decision	why	evidence	result
```

Each row should have an ISO 8601 timestamp, a short phase, a plain-language decision, its reason, a pointer such as a file/line, test command, commit or artifact, and the observed result. Evidence is a pointer, not a paragraph. If TSV content comes from untrusted input, sanitize tabs/newlines and spreadsheet formula-leading characters before writing it.

## Use and review

- Start by reading the existing log's last entries; append rather than rewriting history.
- Log only meaningful checkpoints. For each completed phase, include the verification performed and its actual result.
- Record a pivot or reversal with the reason it happened; do not silently replace a prior decision.
- Before handoff, check that each entry describes something that actually happened and that its evidence pointer resolves.
- Summarize the log's conclusions in the final response. Do not treat the log as a substitute for tests, review, or an Obsidian article.

For short tasks, skip the log. When the project uses `obsidian-session-loop`, use the verified decisions and evidence from this trail as source material for a qualifying end-of-session article; do not copy private or irrelevant log details into the vault.
