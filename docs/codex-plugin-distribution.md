# Codex Plugin Distribution

## Current Assessment

As of May 23, 2026, the practical public distribution path for Codex-Arsenal is npm. OpenAI's public Codex material says Codex users can browse the plugins library and create plugins in the Codex app, but it does not document a general public submission process for third-party plugins.

Relevant OpenAI pages:

- [Plugins and skills](https://openai.com/academy/codex-plugins-and-skills/)
- [Codex](https://openai.com/codex/)
- [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540/)

## Recommended Path

1. Keep publishing installable skills, prompts, configs, and workflow files through `codex-arsenal` on npm.
2. Keep plugin ideas in `plugins/<name>/` until they become real Codex plugins.
3. When a plugin is ready for Codex app testing, convert it to a Codex plugin structure with `.codex-plugin/plugin.json`.
4. Add a repo-local marketplace entry in `.agents/plugins/marketplace.json` for team/local installation.
5. If OpenAI opens a formal public marketplace submission path, package the plugin manifest, documentation, permission model, and test notes for review.

## Repo Marketplace Shape

Use this shape for local or team discovery:

```json
{
  "name": "codex-arsenal",
  "interface": {
    "displayName": "Codex-Arsenal"
  },
  "plugins": [
    {
      "name": "context-window-compressor",
      "source": {
        "source": "local",
        "path": "./plugins/context-window-compressor"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

## Before Submitting Anywhere

- Define exactly what external systems the plugin touches.
- Keep permissions narrow and explain authentication.
- Provide a small demo workflow and screenshots if the plugin has UI.
- Include test notes for install, auth, failure states, and uninstall.
- Avoid bundling broad arsenals into one plugin. Publish focused plugins that solve one job well.
