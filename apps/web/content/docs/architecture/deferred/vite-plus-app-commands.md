---
title: Vite+ app commands
description: Deferred — `vp dev`, `vp build` and `vp migrate` for the web app, which is a Nuxt app rather than a Vite one.
---

# Vite+ App Commands

Vite+'s `dev`, `build` and `migrate` are built for a project that calls Vite directly. The web app does not: Nuxt owns the dev server, the build and the module graph, and `vp dev` in a Nuxt project prints a hint pointing at the package script and starts plain Vite ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506)). The app build runs as the `build:app` task instead, through `nuxt build` ([Vite+](/docs/architecture/vite-plus)).

`vp migrate` is ruled out on three counts, any one enough: it migrates a monorepo only from the workspace root, rewriting the shared package-manager configuration and the lockfile at once; it rewrites `vite` imports to `vite-plus` in config entry files and `vitest` imports to `vite-plus/test` in every package that does not declare `@nuxt/test-utils`; and it merges every tool's config into one generated `vite.config.ts`, where this repository keeps each tool's settings in a module of its own. It has no documented meta-framework handling either.

## Revisit when

Nuxt stops owning the module graph, or the Nuxt integration request ships — a module exposing Vite+ config from `nuxt.config.ts` and `vp dev`/`vp build` calling Nuxt's own commands ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506)).
