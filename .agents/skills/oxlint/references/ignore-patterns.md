# `ignorePatterns`

Read when editing `oxlint.config.ts`'s `ignorePatterns`, when the oxlint step hangs, or when a linter walks an agent worktree.

## `ignorePatterns` — a source file is excluded only for a tsgo hang

`options.typeAware: true` runs `tsgolint`, which drives the experimental tsgo. tsgo can **infinite-loop** building the type graph of a file that imports giant recursive types, such as `three/webgpu` and `three/tsl`, and a hang of that kind is the only reason a source file is excluded. Importing those types is not itself the trigger: the Genshin engine's TSL lints in about a second, so a new exclusion needs a file measured to hang. `oxlint.config.ts` excludes no source file, so the fluid simulator's composable is linted with the rest. A hang stops the whole `oxlint` step, and every other file lints in seconds, so bisect a suspected hang per-directory, then per-file.

The CI symptom is not what it looks like: the Lint job has no `timeout-minutes` and the workflow sets `cancel-in-progress`, so it runs until the next push cancels it and reports `ELIFECYCLE exit 129` (SIGHUP) — **not** a heap error, which would be 134 with `heap out of memory`. typescript-eslint does not hang where tsgo does: it uses the mature `typescript` compiler via `projectService`, not tsgo.

oxlint has no per-file type-aware toggle — `overrides` cannot set `options.typeAware` — so for a hang, `ignorePatterns` is the only lever. A file that finishes but makes one rule expensive takes a per-rule override instead (`references/type-aware-cost.md`). Recheck whether a newer `oxlint-tsgolint` / tsgo fixes a hang before adding an exclusion for it.

## `ignorePatterns` — the tileset glob is one value for both linters

The Tiled tileset glob is the named export `TILESET_IGNORE_PATTERN` in `oxlint.config.ts`. Its `ignorePatterns` spreads it, and `packages/configuration/eslint/ignores.js` imports it, so a tileset folder that moves is edited in that one line and both passes follow. Never write the glob a second time in either file.

## `ignorePatterns` — `.agents/worktrees` is load-bearing

Agent worktrees are full parallel checkouts of this monorepo nested at `.agents/worktrees/<name>/`, so without that entry both linters walk a second copy of the whole repo per live worktree and report every diagnostic at another branch's path. It has to be stated here rather than left to git: the only thing hiding those paths from git is the agent harness's machine-local `.git/info/exclude`, which no clone or CI runner has. This one entry covers ESLint too — `eslint-plugin-oxlint`'s `buildFromOxlintConfig` turns `ignorePatterns` into flat-config `ignores`. The path itself is owned by `AGENT_WORKTREES_DIRECTORY` in `@esposter/configuration` (which carries the full rationale) and pinned to this file by `scripts/src/workspace/agentDirectories.test.ts`.
