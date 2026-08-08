---
title: Bundle budgets
description: Deferred — an enforced payload ceiling in CI instead of the manual, thresholdless analyze run.
---

# Bundle Budgets

A size ceiling that fails a build: `size-limit`, `bundlesize`, `bundlewatch`, or Lighthouse CI wired into a workflow, so a change that grows the first-load payload past a configured number is rejected at review time rather than noticed later.

Nothing of the sort is installed, and no workflow in `.github/workflows/` inspects build output size. The only tooling is the `analyze` script in `packages/app/package.json` — a plain `nuxt analyze` — which is manual, produces a treemap to look at, and enforces no threshold. `configuration/vite.ts` sets no `manualChunks` and no `chunkSizeWarningLimit`, so Rollup's own size warning is at its default and chunking is entirely Nuxt's.

Payload control today is idiomatic rather than measured: Nuxt's per-route code splitting, component maps that resolve their components lazily, and explicit dynamic imports for the heavy ones — `app/components/Docs/Mermaid.vue` imports mermaid only after mount, precisely so the multi-megabyte chunk never lands in the docs route's initial load. (The `ssr: false` entries in `configuration/routeRules.ts` are often mistaken for a payload lever; their comment says otherwise — they exist because those pages touch `window`/`localStorage` during setup and crash under SSR.)

## Why deferred

- A budget is only useful if a breach changes a decision. This app deliberately ships heavy client-only surfaces — Phaser games, LiveKit, a PDF viewer, GrapesJS, mermaid — whose weight is a product choice already made. A single global number would be tripped by design on the routes that carry them, and the response would be to raise the number, which is how a budget becomes decoration.
- The number worth guarding is per-route first-load, not total build size, and getting from `nuxt analyze` output to a per-route attribution is real work rather than a config file. Guarding the wrong number is worse than guarding none, because it produces a green check that means nothing.
- The failure mode a budget catches — a dependency quietly landing in the shared entry chunk — has not happened here, and the lazy-import discipline above is what prevents it.

## Revisit when

A heavy dependency lands in the **shared** entry chunk rather than a route or lazy chunk, so one feature's weight is paid by every route's first load — or real users on slow connections report load times. Either makes the per-route first-load number worth defining before it is enforced.

## Cheaper interim

Run `pnpm analyze` in `packages/app` before merging anything that adds a runtime dependency, and keep the discipline that already works: heavy libraries behind a dynamic `import()` resolved after mount, never a top-level import in a component that a common route renders.
