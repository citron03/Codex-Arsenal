---
name: anti-ai-slop
description: Review and revise AI-assisted writing, documentation, software changes, or media for low information value, repetition, unsupported claims, template-like structure, and poor audience fit. Use when asked to critique, clean up, or make an artifact more useful; do not use it to guess whether a person used AI.
---

# Anti-AI-Slop Review

Improve the artifact for its actual audience and purpose. “AI slop” has no single agreed definition, and recognizable style tics are not proof of AI authorship. Review observable quality and impact, not provenance. Read [quality signals](references/quality-signals.md) when applying this review.

## Review

1. Identify the artifact, intended audience, purpose, and constraints. If these are unclear and materially change the edit, ask; otherwise state a reasonable assumption.
2. Inspect the whole artifact and its context before editing. For code, inspect the diff and relevant callers/tests; for media, inspect only the assets or render you can actually see.
3. Flag specific passages or elements that make the result less useful: unsupported or fabricated claims, generic filler, repeated points, predictable scaffolding that adds no value, irrelevant detail, mismatched tone, confusing logic, or avoidable reviewer/reader burden. Tie every finding to a location and its likely impact.
4. Revise only confirmed problems. Prefer removing filler, replacing vague advice with verified specifics, reordering for comprehension, and simplifying unnecessary structure. Preserve the author's intent, distinctive voice, useful conventions, and appropriate genre structure.
5. Recheck the edited artifact against the original goal. Confirm factual claims have support, no new specifics were invented, and the edit did not create new repetition, inconsistency, or scope.

## Guardrails

- Do not score “AI-ness,” claim a human or model authored something, or treat a phrase, punctuation mark, typo, or smooth prose as evidence.
- Do not ban em dashes, bullet lists, headings, transitions, or common phrases. Change a pattern only when its repetition or placement harms this artifact.
- Do not add fake anecdotes, personal experience, deliberate mistakes, slang, or arbitrary stylistic quirks to make text seem human.
- Do not replace a missing fact with a plausible guess. Ask for the source, qualify the uncertainty, or mark the gap for the author.
- Do not rewrite a sound section just to demonstrate activity. If no material issue is found, say so and leave it unchanged.
- For code and pull requests, reduce unnecessary scope and reviewer burden; verify behavior rather than merely polishing comments or formatting.

## Report

Give a short result with the material findings, what you changed (or left alone), and any unresolved evidence gaps. Distinguish confirmed defects from subjective style preferences.
