# Design Principles

Why Codex-Arsenal is built the way it is.

This document records the decisions behind the project rather than its usage —
`README.md` covers that. Each principle states what was decided, why, **what it
cost**, and where it lives in the code. The costs are listed because a principle
without a price is usually a slogan.

A Korean translation is at [`docs/ko/design-principles.md`](./ko/design-principles.md).

---

## 1. Installable, not a list

Codex-Arsenal copies real files into real projects. It is not a curated list of
links.

**Why.** A list is read once and closed. A file that lands in a project root is
loaded by the agent on every session, shows up in code review, and gets edited
when it turns out to be wrong. The difference is not convenience — it is whether
the guidance is in the loop at all.

**What it cost.** Every item has to be a maintained file with a manifest entry
and a test, so adding content is far heavier than appending a bookmark. The
repository grows slowly on purpose. It also means the project owns the
correctness of what it installs: when the default install turned out to write a
filename Codex never loaded, that was a defect in this project, not a stale link
in someone else's list.

**Where.** Every top-level content directory: `prompts/`, `skills/`, `configs/`,
`workflows/`, `plugins/`.

## 2. One manifest is the source of truth

`lib/manifest.js` holds all 19 installable items. `list`, `get`, and `init` are
all projections of that array — no second registry, no directory scanning.

**Why.** The alternative is a list in the README, a list in the CLI, and a set of
files on disk, which drift apart within a few commits. A single array means a new
item appears everywhere at once, and a test can assert that every declared source
file actually exists.

**What it cost.** Manual bookkeeping. Adding a file means editing the manifest by
hand, and forgetting to is a silent no-op. At 19 items this is comfortable; at
40 or 50 it will need generating from the directory tree, and that change will
not be free.

**Where.** `lib/manifest.js`, and the manifest suite in `test/manifest.test.js`
which walks every entry and calls `access()` on its `src`.

## 3. Never overwrite by default

Existing files are skipped. Overwriting requires `--force`, typed deliberately.

**Why.** The files this tool installs are exactly the files a user edits after
installing them. A guidance file that silently reverts to the packaged version on
the next `init` is worse than no tool at all, because the loss is quiet.

**What it cost.** The reverse surprise: after an item is improved upstream,
re-running `init` does nothing visible, and the user has to know `--force`
exists. The CLI mitigates this by printing `skipped ... (already exists; use
--force to overwrite)` for every skipped file rather than staying silent about
it.

**Where.** `installItems` in `lib/installer.js`; the same rule governs
`writeIfNeeded` in `lib/obsidian-bridge.js`.

## 4. An installer must not write outside its target

Every destination is resolved and rejected if it escapes the target directory,
before anything is read or written.

**Why.** The manifest is data that describes file destinations. Treating data as
trusted because it currently lives in this repository is how path traversal gets
shipped — a single `../` in a `dest` would otherwise write anywhere the process
can reach.

**What it cost.** Very little, which is the point: the check is four lines and
runs once per file. It does forbid a legitimate-sounding case — installing into a
sibling directory — but `--dir` covers that intent explicitly.

**Where.** `resolveDestination` in `lib/installer.js`, with a test that asserts
a malicious `dest` fails without creating the file.

## 5. No runtime dependencies

The published package installs nothing. Node built-ins only; `semantic-release`
is the single devDependency.

**Why.** This is a tool people run through `npx` in someone else's project. Every
transitive dependency is a supply-chain surface and an install delay imposed on a
user who only wanted to copy a Markdown file.

**What it cost.** Code that a library would have handled correctly. `lib/fetcher.js`
is a hand-written HTTPS getter, and it followed redirects with no depth limit
until v0.7.3 — a redirect loop recursed until the stack overflowed instead of
raising an error. A dependency would have shipped that bound on day one. The
principle is still right for a package this small, but it is not free, and the
honest version of "zero dependencies" includes the bugs you now own.

**Where.** `package.json`, and `lib/fetcher.js` where `MAX_REDIRECTS` now caps it.

## 6. Read locally, fall back to the network

Item sources are read from the installed package first, and fetched from GitHub
raw only if the file is missing.

**Why.** A published package whose `files` list omits a source would otherwise be
broken for every user until a re-release. The fallback turns a packaging mistake
into a slower install instead of a failure.

**What it cost.** A safety net that can hide the thing it catches. A missing file
still works in testing, so the packaging bug survives. It also means an install
can quietly depend on the network and on `main` — which may hold content newer
than the version being installed. Verifying with `npm pack --dry-run` before
release is what keeps the net from being load-bearing.

**Where.** `readSourceFile` in `lib/installer.js`; `BASE_URL` in `lib/manifest.js`.

## 7. The filename is part of the contract

Guidance ships as `AGENTS.md`, because that is the only instruction filename
Codex loads automatically.

**Why.** Content that is never read has no value however good it is. Until
v0.7.4 this project installed `CODEX.md`, which Codex does not auto-load, so the
flagship default install produced an inert file and nothing surfaced that. The
name was doing work that the contents could not do.

**What it cost.** A permanent alias. The manifest id is now `agents-md`, and
`codex-md` is kept as an alias so previously documented commands keep working —
carried indefinitely for the benefit of callers who may not exist. That was
judged cheaper than a breaking change to a published package.

**Where.** `AGENTS.md`; the `aliases` field and `findManifestItems` in
`lib/manifest.js`.

## 8. The commit type is the release decision

Versions are never chosen by hand. `semantic-release` reads Conventional Commits
on `main` and derives the version, tag, notes, and npm publish from them.

**Why.** Manual versioning is a judgment call made while tired, at the end of the
work, by the person least able to be objective about it. Moving the decision into
the commit message moves it to the moment the change is actually understood.

**What it cost.** The commit message becomes load-bearing with no human
checkpoint after it. A real fix committed as `chore:` never reaches users, and a
`feat:` on a docs change publishes a needless minor version — both silently.
`package.json` also permanently reads `0.0.0-semantically-released`, since the
real version is set in CI and never committed back; it looks like a bug until you
know why.

**Where.** `.releaserc.json`, `.github/workflows/publish.yml`, and the commit
table in `README.md`.

## 9. Verify the rule, don't cite it

Where a claim can be tested cheaply, it gets tested — even when the general rule
already answers it.

**Why.** General rules are true in general. This repository carried both an
`.npmignore` and a `files` allowlist, and "`files` wins" makes deleting the
former look free. Stating the assertion first — *the tarball must be identical
either way* — and running `npm pack --dry-run` both ways turned a plausible
assumption into evidence that could go in the commit message.

**What it cost.** A round trip per claim, which does not pay for itself on
trivial changes. Worth spending when the change is hard to reverse or affects
what ships. The habit justified itself immediately: the follow-up claim written
into this repository's own example was wrong, and testing it against npm 10.9.2
caught it before release.

**Where.** `AGENTS.md` §3 and §6; the worked cases in `examples/README.md`.

---

## What this project is not

- **Not a framework.** It copies files. There is no runtime, no plugin loader,
  and no abstraction over the agent.
- **Not agent-agnostic.** It targets Codex specifically, down to the filename
  Codex loads. Portability across agents is not a goal.
- **Not a place for untested advice.** Content is expected to have been used on
  real work; `references/README.md` requires that a source was read, and
  `examples/README.md` requires a commit or run that a reader can inspect.
