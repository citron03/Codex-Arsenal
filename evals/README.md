# Skill Evals

Keep a small activation set for each skill whose routing matters. Include direct
and indirect prompts that should trigger it, plus adjacent requests that should
not. These CSVs are review fixtures, not automated model-eval results; run them
with the target Codex version when changing a skill's name, description, or
trigger boundary.

OpenAI's [skill evaluation guide](https://developers.openai.com/blog/eval-skills)
recommends starting with a small representative prompt set and inspecting both
activation and behavior before adding more elaborate graders.
