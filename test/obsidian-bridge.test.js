import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildArticleMarkdown,
  draftObsidianArticle,
  openObsidianNote,
  resolveObsidianLaunchSpec,
  shouldDraftArticle,
  syncObsidianNotes
} from "../lib/obsidian-bridge.js";

describe("obsidian bridge", () => {
  it("uses the configured threshold to decide whether to draft an article", () => {
    const config = { articleRules: { minimumSignalsForDraft: 2 } };

    assert.equal(shouldDraftArticle({ signals: ["a"], config }), false);
    assert.equal(shouldDraftArticle({ signals: ["a", "b"], config }), true);
    assert.equal(shouldDraftArticle({ signals: [], config, integrationBoundary: true }), true);
  });

  it("builds a readable article draft", () => {
    const markdown = buildArticleMarkdown({
      title: "Session Bridge",
      summary: "Added an Obsidian bridge.",
      changes: ["Added a command", "Added note templates"],
      decisions: ["Kept the config file-based"],
      verification: ["npm test"],
      nextSteps: ["Add vault-specific file naming"]
    });

    assert.match(markdown, /^# Session Bridge/m);
    assert.match(markdown, /## What Changed/);
    assert.match(markdown, /Added an Obsidian bridge\./);
  });

  it("syncs the session notes into the configured vault layout", async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), "codex-vault-"));
    const config = {
      sessionInitializer: "prompts/session-bootstrap.md",
      codeStyleNote: "prompts/code-style.md",
      meaningfulWorkNote: "prompts/meaningful-work.md",
      obsidian: {
        enabled: true,
        vaultPath: vaultRoot,
        noteTargets: {
          sessionInitializer: "Codex/Session-Initializer.md",
          codeStyle: "Codex/Code-Style.md",
          meaningfulWork: "Codex/Meaningful-Work.md"
        }
      }
    };

    try {
      const result = await syncObsidianNotes({
        config,
        readSource: async (sourcePath) => `source:${sourcePath}`
      });

      assert.deepEqual(result.synced.sort(), [
        "Codex/Code-Style.md",
        "Codex/Meaningful-Work.md",
        "Codex/Session-Initializer.md"
      ]);
      assert.equal(await readFile(join(vaultRoot, "Codex/Session-Initializer.md"), "utf8"), "source:prompts/session-bootstrap.md");
    } finally {
      await rm(vaultRoot, { recursive: true, force: true });
    }
  });

  it("writes an article draft when the meaningful-work threshold is met", async () => {
    const vaultRoot = await mkdtemp(join(tmpdir(), "codex-vault-"));
    const config = {
      articleRules: { minimumSignalsForDraft: 2 },
      obsidian: {
        enabled: true,
        vaultPath: vaultRoot,
        inboxPath: "Inbox/Codex"
      }
    };

    try {
      const result = await draftObsidianArticle({
        config,
        title: "Bridge article",
        summary: "Documented the new bridge.",
        changes: ["Added a draft command"],
        decisions: ["Kept it file-based"],
        verification: ["npm test"],
        nextSteps: ["Connect to a vault-local automation"],
        signals: ["new integration boundary", "README update"]
      });

      assert.equal(result.skipped, false);
      assert.ok(result.written);
      const output = await readFile(join(vaultRoot, result.written), "utf8");
      assert.match(output, /# Bridge article/);
      assert.match(output, /Documented the new bridge\./);
    } finally {
      await rm(vaultRoot, { recursive: true, force: true });
    }
  });

  it("builds a launch uri when no Obsidian CLI template is configured", () => {
    const spec = resolveObsidianLaunchSpec({
      cwd: "/workspace",
      config: {
        obsidian: {
          enabled: true,
          vaultPath: "~/Obsidian/Codex"
        }
      },
      filePath: "Codex/Session-Initializer.md"
    });

    assert.equal(spec.type, "uri");
    assert.match(spec.uri, /^obsidian:\/\/open\?vault=Codex&file=/);
  });

  it("uses a configured Obsidian launch template when available", () => {
    const spec = resolveObsidianLaunchSpec({
      cwd: "/workspace",
      config: {
        obsidian: {
          enabled: true,
          vaultPath: "/vault/Codex",
          launch: {
            open: {
              command: "obsidian",
              args: ["open", "{file}", "--vault", "{vault}", "--mode", "{mode}"]
            }
          }
        }
      },
      filePath: "Codex/Session-Initializer.md",
      mode: "open"
    });

    assert.equal(spec.type, "command");
    assert.equal(spec.command, "obsidian");
    assert.deepEqual(spec.args, [
      "open",
      "Codex/Session-Initializer.md",
      "--vault",
      "Codex",
      "--mode",
      "open"
    ]);
  });

  it("launches a configured note using an injected runner", async () => {
    const calls = [];
    const result = await openObsidianNote({
      cwd: "/workspace",
      config: {
        obsidian: {
          enabled: true,
          vaultPath: "/vault/Codex",
          launch: {
            open: {
              command: "obsidian",
              args: ["open", "{file}"]
            }
          }
        }
      },
      filePath: "Codex/Session-Initializer.md",
      runner: async (command, args) => {
        calls.push({ command, args });
      }
    });

    assert.equal(result.launched, true);
    assert.equal(calls[0].command, "obsidian");
    assert.deepEqual(calls[0].args, ["open", "Codex/Session-Initializer.md"]);
  });
});

describe("obsidian bridge containment", () => {
  async function vault() {
    const root = await mkdtemp(join(tmpdir(), "codex-arsenal-vault-"));
    await mkdir(join(root, "vault"), { recursive: true });
    await mkdir(join(root, "proj", "prompts"), { recursive: true });
    for (const note of ["session-bootstrap", "code-style", "meaningful-work"]) {
      await writeFile(join(root, "proj", "prompts", `${note}.md`), "content", "utf8");
    }
    return root;
  }

  function config(root, overrides = {}) {
    return {
      obsidian: {
        enabled: true,
        vaultPath: join(root, "vault"),
        inboxPath: "Inbox/Codex",
        noteTargets: {
          sessionInitializer: "Codex/Session-Initializer.md",
          codeStyle: "Codex/Code-Style.md",
          meaningfulWork: "Codex/Meaningful-Work.md"
        },
        ...overrides
      },
      articleRules: { minimumSignalsForDraft: 1 }
    };
  }

  it("refuses a noteTarget that climbs out of the vault", async () => {
    const root = await vault();
    try {
      await assert.rejects(
        syncObsidianNotes({
          cwd: join(root, "proj"),
          config: config(root, { noteTargets: { sessionInitializer: "../outside/escaped.md" } })
        }),
        /Obsidian note must be inside the vault/
      );
      await assert.rejects(readFile(join(root, "outside", "escaped.md"), "utf8"), { code: "ENOENT" });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("refuses an inboxPath that climbs out of the vault", async () => {
    const root = await vault();
    try {
      await assert.rejects(
        draftObsidianArticle({
          cwd: join(root, "proj"),
          config: config(root, { inboxPath: "../outside/inbox" }),
          title: "Escaped",
          summary: "x",
          integrationBoundary: true
        }),
        /Obsidian article must be inside the vault/
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("still writes notes that stay inside the vault", async () => {
    const root = await vault();
    try {
      const result = await syncObsidianNotes({ cwd: join(root, "proj"), config: config(root) });
      assert.equal(result.synced.length, 3);
      assert.equal(await readFile(join(root, "vault", "Codex", "Code-Style.md"), "utf8"), "content");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
