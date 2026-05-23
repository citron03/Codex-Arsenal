export const REPO = "citron03/Codex-Arsenal";
export const BRANCH = "main";
export const BASE_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

export const MANIFEST = [
  {
    id: "codex-md",
    category: "Behavior Guidelines",
    label: "CODEX.md",
    description: "Behavior guidelines for Codex agents in software projects.",
    files: [{ src: "CODEX.md", dest: "CODEX.md" }],
    default: true
  },
  {
    id: "claude-md",
    category: "Behavior Guidelines",
    label: "CLAUDE.md",
    description: "Behavior guidelines adapted for Claude Code agents.",
    files: [{ src: "CLAUDE.md", dest: "CLAUDE.md" }]
  },
  {
    id: "config-codex",
    category: "Configs",
    label: ".codex/config.json",
    description: "Starter Codex agent configuration.",
    files: [{ src: "configs/codex/config.json", dest: ".codex/config.json" }]
  },
  {
    id: "config-vscode",
    category: "Configs",
    label: ".vscode/settings.json",
    description: "VS Code settings for AI-assisted development.",
    files: [{ src: "configs/vscode/settings.json", dest: ".vscode/settings.json" }]
  },
  {
    id: "prompt-solo-dev",
    category: "Prompts",
    label: "solo-dev system prompt",
    description: "System prompt template for solo developer workflows.",
    files: [{ src: "prompts/system-prompts/solo-dev.md", dest: "prompts/system-prompts/solo-dev.md" }]
  },
  {
    id: "skill-debug-workflow",
    category: "Skills",
    label: "debug-workflow",
    description: "A repeatable skill for reproducing, diagnosing, and fixing bugs.",
    files: [
      { src: "skills/debug-workflow/README.md", dest: "skills/debug-workflow/README.md" },
      { src: "skills/debug-workflow/prompt.md", dest: "skills/debug-workflow/prompt.md" },
      { src: "skills/debug-workflow/workflow.json", dest: "skills/debug-workflow/workflow.json" }
    ]
  },
  {
    id: "skill-test-gen",
    category: "Skills",
    label: "test-gen",
    description: "A skill for generating focused tests from function signatures and behavior notes.",
    files: [
      { src: "skills/test-gen/README.md", dest: "skills/test-gen/README.md" },
      { src: "skills/test-gen/prompt.md", dest: "skills/test-gen/prompt.md" }
    ]
  },
  {
    id: "skill-publishing-npm-packages",
    category: "Skills",
    label: "publishing-npm-packages",
    description: "A Codex skill for preparing, troubleshooting, and automating npm package releases.",
    files: [
      { src: "skills/publishing-npm-packages/SKILL.md", dest: "skills/publishing-npm-packages/SKILL.md" }
    ]
  },
  {
    id: "plugin-context-window-compressor",
    category: "Plugins",
    label: "context-window-compressor",
    description: "Plugin sketch for summarizing long context before it becomes unmanageable.",
    files: [
      { src: "plugins/context-window-compressor/README.md", dest: "plugins/context-window-compressor/README.md" },
      { src: "plugins/context-window-compressor/plugin.json", dest: "plugins/context-window-compressor/plugin.json" }
    ]
  },
  {
    id: "workflow-solo-dev-loop",
    category: "Workflows",
    label: "solo-dev-loop",
    description: "Plan, code, test, and commit loop for solo developers working with agents.",
    files: [
      { src: "workflows/solo-dev-loop/README.md", dest: "workflows/solo-dev-loop/README.md" },
      { src: "workflows/solo-dev-loop/setup.sh", dest: "workflows/solo-dev-loop/setup.sh" }
    ]
  }
];

export function findManifestItems(ids) {
  return ids.map((id) => {
    const item = MANIFEST.find((entry) => entry.id === id);
    if (!item) {
      throw new Error(`Unknown item: ${id}`);
    }
    return item;
  });
}
