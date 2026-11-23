# Codex Plugin Distribution

Last reviewed: 2026-11-23.

Codex-Arsenal's npm package distributes project files. A Codex plugin is a
separate installable package with its own manifest and runtime integration;
the two distribution channels solve different problems.

## Current Options

- **Standalone skills and files:** use the npm CLI for reusable project-local
  `AGENTS.md`, configs, prompts, and `.agents/skills/` content.
- **Codex plugins:** use the current portable Agent Plugins format, with a root
  `plugin.json`; optional `skills/`, `mcp.json`, and assets stay beside it.
  OpenAI-specific plugin metadata belongs in `extensions.com.openai`.
- **Lifecycle hooks:** Codex supports hooks such as `SessionStart` and
  `SessionEnd` in local configuration and plugins. Plugin hooks require a
  manually installed Codex desktop plugin, must be available in the execution
  environment, and are skipped until the user reviews and trusts them. Plugins
  containing lifecycle hooks are not eligible for the public plugin directory.

OpenAI now documents a public plugin submission flow. Follow the current
[plugin packaging guide](https://developers.openai.com/plugins/build/plugins)
and [submission guide](https://developers.openai.com/plugins/deploy/submission)
when a plugin is ready. Do not assume npm publication submits or installs a
Codex plugin.

## This Repository

The entries in `plugins/` are design sketches, not plugins that Codex can
install. Keep them labelled as sketches until each has a valid manifest, an
implemented capability, and a tested installation path. The Obsidian bridge is
currently shipped as an npm CLI plus project-local instructions and config;
it does not need a plugin wrapper for ordinary file sync and article drafts.

If a future plugin adds hooks, decide whether manual desktop-only installation
is an acceptable tradeoff before building around them. If public-directory
distribution matters, keep the plugin hook-free and package hook-dependent
behavior separately.

## Plugin Readiness Checklist

- Use a current root `plugin.json` manifest and validate referenced paths.
- Keep each plugin focused on a recognizable user goal; bundle only related
  skills, MCP servers, and assets.
- Declare external systems and authentication requirements; never put secrets
  in manifests or packaged files.
- Document setup, trust review, permissions, failure behavior, and removal.
- Test activation with direct, indirect, incomplete, and negative prompts, plus
  the actual install and tool flow.
- Recheck the current submission requirements before publishing; the plugin
  format and eligibility rules can change independently of npm releases.

## References

- [Build skills](https://developers.openai.com/plugins/build/skills)
- [Package your plugin](https://developers.openai.com/plugins/build/plugins)
- [Plugin architecture](https://developers.openai.com/plugins/concepts/plugins)
- [Codex hooks](https://learn.chatgpt.com/docs/hooks)
- [Agent Plugins specification](https://agent-plugins.org/)
