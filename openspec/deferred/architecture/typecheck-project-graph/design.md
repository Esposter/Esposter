# Typecheck project graph

The idea is one solution tsconfig at the repository root, with `files: []` and a `references` entry per package, checked by a single `tsrs -b --fast`. Today every package's `typecheck` is its own `tsrs --fast` process and pnpm runs them in parallel. `apps/web` already has the solution shape for the four projects Nuxt generates, so the mechanism is proven here; the question is whether it earns the same shape across the packages.

## Why not

**A cold run is slower than the per-package processes.** On a four-core Linux machine, over the packages that can be referenced, one `tsrs -b` took roughly one and a half times the wall-clock and CPU of the same projects run as separate processes four at a time. Adding `--builders` made no difference. The cause was not isolated, so the finding is the measurement and not an explanation.

**What a solution build buys is incremental, and no runner here checks incrementally.** With the build info already written, a run with nothing changed, or with an edit to a package few others import, finished in well under a second. An edit to the type surface of `@esposter/shared`, which nearly every project depends on, cost as much as a cold run. Every package already resolves its siblings from source through the `source` condition, so the references would add nothing to resolution; the only gain is skipping unchanged projects. CI starts from a clean checkout and its workspace typecheck task is uncached, and a session runs only the tests of what it touched and leaves the typecheck to CI, so neither would ever read a warm build info.

**It would not cover every project.** The three Vue packages extend a tsconfig that sets no `composite`, and a referenced project must set it, so they would stay on their own script. `packages/genshin-mods` fails alone on the engine's declarations, which exist only beside a mod the engine has loaded (the [Claude Code mods](../../../specs/architecture/claude-mods/design.md) design). `apps/web` needs `nuxt prepare` first, and the content mapper needs `--runExternalCode`. A solution over the rest would leave two typecheck paths where there is one.

**A second cache layer is the price of the gain.** Persisting `*.tsbuildinfo` between CI runs means a cache key, an invalidation rule and a stale-verdict failure mode, beside the task cache that already holds the typecheck leaves.

## Revisit when

Any of these, and the Vue packages' `composite` gap closes with it:

- CI persists the incremental state between runs, or the typecheck becomes a repeated local gate instead of CI's.
- A re-measurement shows a cold `tsrs -b` matching or beating separate processes at the same core count, including with `--builders`.

Whether published guidance favours project references or plain per-package no-emit tasks was not checked against primary sources, so the decision rests on the measurement above and not on a convention.

## Measuring it again

Build a throwaway solution tsconfig outside the repository whose `references` list the packages that set `composite`, leaving out the Vue packages, `packages/genshin-mods` and the apps. Compare, over the same projects:

- one `tsrs --fast` per project, four at a time, against
- one `tsrs -b --fast` over the solution, cold (build info deleted), warm with nothing changed, warm after a leaf edit, and warm after an edit to the type surface of `@esposter/shared`.

Delete every `*.tsbuildinfo` afterwards; they are ignored by git but are state the next run would read.

## Key files

| File                                                     | Role                                                                          |
| :------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `packages/configuration/tsconfig.base.json`              | sets `customConditions: ["source"]`, so a sibling resolves from source        |
| `packages/configuration/tsconfig.vue.json`               | the Vue packages' base: carries the content mapper and no `composite`         |
| `packages/configuration/tsconfig.library.json`           | sets `composite` and `isolatedDeclarations`, the setting a reference requires |
| `apps/web/tsconfig.json`                                 | the one solution file today                                                   |
| `vite.config.ts`                                         | the typecheck tasks, where a per-package script is run in parallel            |
| `openspec/specs/architecture/monorepo-tooling/design.md` | the spec that states the decision and points here for the rationale           |
