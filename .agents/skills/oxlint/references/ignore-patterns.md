# `ignorePatterns`

Read when editing `oxlint.config.ts`'s `ignorePatterns`, when the oxlint step hangs, or when a linter walks an agent worktree.

## `ignorePatterns` — the tsgo hang is load-bearing

`options.typeAware: true` runs `tsgolint`, which drives the experimental tsgo. tsgo **infinite-loops** building the type graph for a file importing the giant recursive `three/webgpu` + `three/tsl` types, which is why the one file that does is in `ignorePatterns`. **Do not remove that exclusion** or the whole `oxlint` step hangs forever — every other file lints in seconds, so bisect a suspected new hang per-directory, then per-file.

The CI symptom is not what it looks like: the Lint job has no `timeout-minutes` and the workflow sets `cancel-in-progress`, so it runs until the next push cancels it and reports `ELIFECYCLE exit 129` (SIGHUP) — **not** a heap error, which would be 134 with `heap out of memory`. typescript-eslint does not hang on the same file: it uses the mature `typescript` compiler via `projectService`, not tsgo.

oxlint has no per-file type-aware toggle — `overrides` cannot set `options.typeAware` — so `ignorePatterns` is the only lever. Recheck whether a newer `oxlint-tsgolint` / tsgo fixes it before assuming the exclusion is still needed.

## `ignorePatterns` — `.agents/worktrees` is load-bearing

Agent worktrees are full parallel checkouts of this monorepo nested at `.agents/worktrees/<name>/`, so without that entry both linters walk a second copy of the whole repo per live worktree and report every diagnostic at another branch's path. It has to be stated here rather than left to git: the only thing hiding those paths from git is the agent harness's machine-local `.git/info/exclude`, which no clone or CI runner has. This one entry covers ESLint too — `eslint-plugin-oxlint`'s `buildFromOxlintConfig` turns `ignorePatterns` into flat-config `ignores`. The path itself is owned by `AGENT_WORKTREES_DIRECTORY` in `@esposter/configuration` (which carries the full rationale) and pinned to this file by `scripts/src/workspace/agentDirectories.test.ts`.
