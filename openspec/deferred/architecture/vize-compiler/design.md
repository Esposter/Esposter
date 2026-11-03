# Vize compiler

Vize compiles Vue single-file components in Rust. Its Nuxt module was tried in the app in place of `@vitejs/plugin-vue` and failed on the repo's own setup, so it was taken back out. A second look at the newest release ran its Nuxt module, its Vite plugin and its rolldown plugin on small standalone projects, and every blocker below still holds. Each one was reduced to an issue on the Vize repository. The Nuxt blocker is open as #11455. #11456 is open, with a comment that the guides put it outside the documented scope. #11457 was closed as configuration. So the library builds and Vitest keep `unplugin-vue`.

## Blockers

### The Nuxt module breaks server rendering

With the Nuxt module installed, a page that calls `onPrehydrate` or renders Nuxt's own `NuxtTime` answers HTTP 500 with `NUXT_E1006`: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline." The first try blamed Vize for compiling Nuxt's `nuxt-time.vue` from `node_modules`, and excluding every `node_modules` component changed nothing. The newest release shows why. One `onPrehydrate` call in a component's own script fails the same way, on Nuxt 4 and on the Nuxt 5 nightly, in development and in a production build. Nuxt 3 is not affected.

Nuxt's prehydrate transform is an object hook with an id filter that the bundler checks before the handler runs. Vize's bridge changes the id that the handler receives and leaves the filter alone, so the transform never runs on a module that Vize compiled. A copy of the module with that one filter removed renders both the call and `NuxtTime`. The report is #11455.

### The Nuxt module's peer range stops short of Nuxt 5

The module's peer range is Nuxt 2 through 4, and the newest release keeps it. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off. It then loads and compiles every component of the app without a failure. Nuxt warns that the module imports "nitropack/runtime" through a Nitro 2 compatibility layer that Nuxt 6 removes.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. Every installed nightly of the builder still declares it. The Vize module keeps that plugin for the components Vize excludes, such as nuxt-og-image's renderers. So the package stays in the lockfile until Nuxt drops the dependency, whatever the app compiles itself.

### The library build's plugin is a Vite plugin

The library builds compile components through `unplugin-vue` in `getTsdownConfigurationVue`, which runs tsdown on rolldown. Vitest compiles through the same plugin in `getVuePlugins`. Vize's Vite plugin uses the `config`, `configResolved`, `configureServer`, `handleHotUpdate` and `apply: "build"` hooks, and rolldown does not call Vite's config hooks. The rolldown build can use only the rolldown entry of "@vizejs/unplugin". Its project lists it as a compatibility preview, and its README calls the Vite integration the most complete one. It builds components, and two behaviours that the build gets from `unplugin-vue` do not carry over.

The first is `<style src>`. The rolldown entry drops the CSS of every `<style src>` block and prints no warning. The Vite plugin keeps it, and `unplugin-vue` needs the workaround in `vueStyleSrcPlugin`, which tracks unplugin-vue issue 201. It was reported as #11456, with a comment that the guides call the rolldown entry experimental and out of scope. CSS is a limited area of the rolldown entry. It writes no CSS file for plain CSS and hands only preprocessor blocks and CSS modules to the bundler.

The second is the TresJS elements, and it is a configuration change. The repo passes the template compiler options that "@tresjs/core" 5.10.1 ships. Its `isCustomElement` function accepts a `Tres*` or `tres-*` tag unless the tag is `TresCanvas`, `TresCanvasContext`, `TresLeches`, `TresScene` or `TresPortal`, and it accepts `primitive`. Four sites pass it: `getTsdownConfigurationVue` and `getVuePlugins` in the world package's build and Vitest configs, and the `tresjs-nuxt` module, which sets `vue.compilerOptions.isCustomElement` and restates the rule in `checkIsTresCustomElement`. Vize takes names and `*` patterns in `customElements`, not a function. The Vite plugin accepts `template.compilerOptions.isCustomElement` and ignores it. That was reported as #11457 and closed as configuration: the Vite plugin guide documents `customElements` with `customRenderer` for custom element tags, and it lists plugin-option parity with `@vitejs/plugin-vue` as not complete yet. The migration:

1. Replace the function with `customRenderer: true` and `customElements: ["Tres*", "primitive"]`, the recipe in the Vite plugin guide. No world component uses a `tres-` tag, so `"tres-*"` is not needed.
2. Keep `TresCanvas` and the other whitelist tags imported in each file. With `customRenderer` set, an imported tag stays a component. Compiled with both settings, the 24 world components that use a Tres tag give the same component or element for all 40 file and tag pairs, over 11 distinct tags. With `customRenderer` unset, `TresCanvas` in two files compiles as an element.
3. Import `TresCanvas` in the two app components that rely on the global registration, `apps/web/app/components/AgentConsole/Theme/Genshin/FallingStar.vue` and `apps/web/app/components/Visual/Gem/Index.vue`, because a pattern cannot exclude a name.
4. Move the Nuxt module off the function. `@vizejs/nuxt` keeps Nuxt's own compiler when it sees a predicate (#7107). This step is not run yet, and the module still fails with #11455.

The rolldown entry gives the same results as the Vite plugin for the list and pattern forms, and it rejects a function in `customElements`.

## Revisit when

Each blocker has a fix that the repo's own setup passes: the Nuxt module renders the home page from a clean start while Nuxt's runtime components keep Nuxt's build transforms, the module's peer range covers the Nuxt in use, Nuxt drops `@vitejs/plugin-vue` from its builder, and the rolldown entry of the Vize plugin leaves its experimental, out-of-scope status and keeps the CSS of a `<style src>` block while the library builds pass with the TresJS elements settled.

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
- [Vize issue 11455](https://github.com/ubugeeei-prod/vize/issues/11455), [11456](https://github.com/ubugeeei-prod/vize/issues/11456) and [11457](https://github.com/ubugeeei-prod/vize/issues/11457) — the three compile-side reports, of which 11455 and 11456 are open and 11457 is closed as configuration.
