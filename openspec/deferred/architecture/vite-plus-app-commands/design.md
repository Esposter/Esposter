# Vite+ App Commands

Vite+'s `dev` and `build` are built for a project that calls Vite directly. The web app does not: Nuxt owns the dev server, the build and the module graph, and `vp dev` in a Nuxt project prints a hint pointing at the package script and starts plain Vite ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506)). The app build runs as a plain `pnpm -C apps/web build` instead, through `nuxt build` ([Vite+](../../../specs/architecture/vite-plus/design.md)).

## Revisit when

Nuxt stops owning the module graph, or the Nuxt integration request ships — a module exposing Vite+ config from `nuxt.config.ts` and `vp dev`/`vp build` calling Nuxt's own commands ([issue 1506](https://github.com/voidzero-dev/vite-plus/issues/1506)).
