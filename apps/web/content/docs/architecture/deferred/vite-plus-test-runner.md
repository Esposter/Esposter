---
title: Vite+ test runner
description: Deferred — running the suite through `vp test` instead of the catalog's Vitest invoked by the root scripts.
---

# Vite+ Test Runner

`vp test` would run the suite through Vite+ instead of the root `test` and `coverage` scripts invoking Vitest directly. Three blockers stand, each checkable before anything changes:

- **The Nuxt Vitest environment.** Well over a hundred test files opt into it with a `@vitest-environment nuxt` pragma, and that environment is supplied by Nuxt's test utilities rather than by Vitest. Whether it still registers under `vp test` decides a large share of the suite.
- **The sharded blob pipeline.** The suite is one root Vitest `projects` config, which is what gives it a single coverage report split along one `--shard` axis; CI fans it across shards with `--reporter=blob` and recombines with `--merge-reports`. A wrapper that drops those flags does not merely run slower — it silently stops being one coverage report, and the aggregate gate that means "every shard passed" goes green over a report that was never written.
- **The import surface.** `vp test` expects its APIs from `vite-plus/test` ([test guide](https://viteplus.dev/guide/test)), and many hundreds of files and the shared configuration factory import from `vitest`. Rewriting them makes Vite+ a source-level dependency of the whole suite, the commitment hardest to reverse, for nothing the task cache does not already give.

The version blocker it once had is gone — the overrides run the catalog's Vitest ([Vite+](/docs/architecture/vite-plus)).

## Revisit when

All three hold together: the Nuxt environment registers under `vp test`, the shard, blob and merge flags forward cleanly, and the `vitest` imports keep working without a rewrite. Any one alone is not enough, and the second is the dangerous one.
