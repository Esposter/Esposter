# Vize compiler

Vize compiles Vue single-file components in Rust. Its Nuxt module was tried in the app in place of `@vitejs/plugin-vue` and failed on the repo's own setup, so it was taken back out. Its Vite plugin was assessed from its published code but never run in the repo, so the library builds and Vitest keep `unplugin-vue`.

## Blockers

### The Nuxt module breaks server rendering

With the Nuxt module installed, the home page answered every request with `NUXT_E1006`: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline." Vize compiled Nuxt's own `nuxt-time.vue` from `node_modules`, outside the build transform Nuxt applies to that component, and the `Byline` component's `NuxtTime` failed on each render. Excluding every `node_modules` component from Vize's compiler left the error in place on the development server that was running at the time. A start with cleared caches did not change it either, so the module was reverted.

### The Nuxt module's peer range stops short of Nuxt 5

The module's peer range is Nuxt 2 through 4. The repo runs the Nuxt 5 nightly, which that range does not cover.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. The Vize module keeps that plugin for the components Vize excludes, such as nuxt-og-image's renderers. So the package stays in the lockfile until Nuxt drops the dependency, whatever the app compiles itself.

### The library build's plugin is a Vite plugin

The library builds compile components through `unplugin-vue` in `getTsdownConfigurationVue`, which runs tsdown on rolldown. Vitest compiles through the same plugin in `getVuePlugins`. Vize's Vite plugin uses the `config`, `configResolved`, `configureServer`, `handleHotUpdate` and `apply: "build"` hooks, and rolldown does not call Vite's config hooks. Nothing in the repo has run it under rolldown.

The build also relies on two behaviours from `unplugin-vue` that Vize has not been shown to match. The first is the `<style src>` workaround in `vueStyleSrcPlugin`, which tracks unplugin-vue issue 201. The second is the `vueOptions` the TresJS packages pass to the compiler so their `TresMesh` element compiles as the renderer expects.

## Revisit when

Each blocker has a fix that the repo's own setup passes: the Nuxt module renders the home page from a clean start while Nuxt's runtime components keep Nuxt's build transforms, the module's peer range covers the Nuxt in use, Nuxt drops `@vitejs/plugin-vue` from its builder, and a Vize plugin passes the library builds under rolldown with the `<style src>` and `TresMesh` cases.

## Key files

| File                                                               | Role                                                                                                  |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `apps/web/configuration/modules.ts`                                | the Nuxt module list, where the Vize module was added and taken back out                              |
| `packages/configuration/src/services/getTsdownConfigurationVue.ts` | the library build's Vue plugins, which a Vize plugin would replace                                    |
| `packages/configuration/src/services/getVuePlugins.ts`             | the Vitest Vue plugins, the same set through each plugin's Vite entry                                 |
| `packages/configuration/src/services/vueStyleSrcPlugin.ts`         | the `<style src>` workaround for unplugin-vue issue 201, which a replacement must also cover          |
| `pnpm-workspace.yaml`                                              | keeps the root `vize` devDependency that the content-mapper spike uses, separate from the Nuxt module |

## Sources

- [Vize repository](https://github.com/ubugeeei-prod/vize) — the repository of `@vizejs/nuxt`, from its npm metadata, which gives the peer range the blockers cite.
