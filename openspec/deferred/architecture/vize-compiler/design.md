# Vize compiler

Vize compiles Vue single-file components in Rust. Its Nuxt module was tried in the app in place of `@vitejs/plugin-vue` and failed on the repo's own setup, so it was taken back out. A second look at the newest release ran its Nuxt module, its Vite plugin and its rolldown plugin on small standalone projects, and every blocker below still holds. Each one is reduced to a draft report in the Vue type check change, so the library builds and Vitest keep `unplugin-vue`.

## Blockers

### The Nuxt module breaks server rendering

With the Nuxt module installed, a page that calls `onPrehydrate` or renders Nuxt's own `NuxtTime` answers HTTP 500 with `NUXT_E1006`: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline." The first try blamed Vize for compiling Nuxt's `nuxt-time.vue` from `node_modules`, and excluding every `node_modules` component changed nothing. The newest release shows why. One `onPrehydrate` call in a component's own script fails the same way, on Nuxt 4 and on the Nuxt 5 nightly, in development and in a production build. Nuxt 3 is not affected.

Nuxt's prehydrate transform is an object hook with an id filter that the bundler checks before the handler runs. Vize's bridge changes the id that the handler receives and leaves the filter alone, so the transform never runs on a module that Vize compiled. A copy of the module with that one filter removed renders both the call and `NuxtTime`.

### The Nuxt module's peer range stops short of Nuxt 5

The module's peer range is Nuxt 2 through 4, and the newest release keeps it. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off. It then loads and compiles every component of the app without a failure. Nuxt warns that the module imports "nitropack/runtime" through a Nitro 2 compatibility layer that Nuxt 6 removes.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. Every installed nightly of the builder still declares it. The Vize module keeps that plugin for the components Vize excludes, such as nuxt-og-image's renderers. So the package stays in the lockfile until Nuxt drops the dependency, whatever the app compiles itself.

### The library build's plugin is a Vite plugin

The library builds compile components through `unplugin-vue` in `getTsdownConfigurationVue`, which runs tsdown on rolldown. Vitest compiles through the same plugin in `getVuePlugins`. Vize's Vite plugin uses the `config`, `configResolved`, `configureServer`, `handleHotUpdate` and `apply: "build"` hooks, and rolldown does not call Vite's config hooks. The rolldown build can use only the rolldown entry of "@vizejs/unplugin". Its project lists it as a compatibility preview, and its README calls the Vite integration the most complete one. It builds components, and two behaviours that the build gets from `unplugin-vue` do not carry over.

The first is `<style src>`. The rolldown entry drops the CSS of every `<style src>` block and prints no warning. The Vite plugin keeps it, and `unplugin-vue` needs the workaround in `vueStyleSrcPlugin`, which tracks unplugin-vue issue 201. CSS is a limited area of the rolldown entry. It writes no CSS file for plain CSS and hands only preprocessor blocks and CSS modules to the bundler.

The second is the TresJS elements. The TresJS packages pass the template compiler options that "@tresjs/core" ships, which hold an `isCustomElement` function. The rolldown entry has no "template" option. The Vite plugin accepts one and ignores the function, so `TresMesh` compiles as a component. The `customElements` option takes names and `*` patterns instead. With `customRenderer` set, a pattern such as `Tres*` compiles `TresMesh` as the renderer expects and keeps an imported `TresCanvas` a component. It cannot keep a `TresCanvas` that the app registers globally, because a pattern cannot exclude a name. That limit matters for the app's Nuxt build and not for the library builds, which import it.

## Revisit when

Each blocker has a fix that the repo's own setup passes: the Nuxt module renders the home page from a clean start while Nuxt's runtime components keep Nuxt's build transforms, the module's peer range covers the Nuxt in use, Nuxt drops `@vitejs/plugin-vue` from its builder, and the rolldown entry of the Vize plugin keeps or reports the CSS of a `<style src>` block while the library builds pass with the TresJS elements settled.

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
