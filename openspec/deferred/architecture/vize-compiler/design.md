# Vize compiler

Vize compiles Vue single-file components in Rust. Its Nuxt module was tried in the app in place of `@vitejs/plugin-vue` and failed on the repo's own setup, so it was taken back out. A second look at the newest release ran its Nuxt module, its Vite plugin and its rolldown plugin on small standalone projects, and every blocker below still holds. Each one was reduced to an issue on the Vize repository. The Nuxt blocker, #11455, is fixed in `@vizejs/nuxt` 0.657.0, and a trial of that release in the app found others (below). #11456 is fixed in `@vizejs/unplugin` 0.658.0, and a trial of that plugin in the library builds found three more gaps (below). #11457 was closed as configuration. So the app, the library builds and Vitest keep `unplugin-vue`.

## Blockers

### The Nuxt module compiles templates without Nuxt's template auto-imports

A trial of `@vizejs/nuxt` 0.657.0 in the app, beside the same app on `@vitejs/plugin-vue`, rendered every public route with status 200 and no `NUXT_E1006`, and the `onPrehydrate` callback of a probe page is serialised into its HTML. It also changed what some routes do:

- `/dungeons` throws `TypeError: _ctx.unref is not a function` while it renders, from seven templates that call `unref` on a grid's nested ref in a `v-for` or a prop (`apps/web/app/components/Dungeons`). Nuxt resolves an auto-imported name in a template for `@vitejs/plugin-vue`'s output, and Vize's output is not resolved the same way. The page draws nothing of its menu, which is an 85% pixel difference from the baseline. Any template that calls an auto-imported function is open to the same failure, and only the routes the trial visited were exercised.
- `/clicker` loses its title: `<Title>` received more than one child, and the page's `<title>` and `og:title` lose the text after the interpolation.
- `/anime` gains a hydration mismatch that the baseline does not log.
- `/about` server-renders a `<canvas data-tres>` where the baseline renders an empty element, because the explicit `TresCanvas` import of the migration below bypasses the client wrapper that `tresjs-nuxt` registers.
- Nuxt warns `NUXT_B9003` that the module imports `nitropack/runtime` through a Nitro 2 layer that Nuxt 6 removes, and the module's own `@nuxt/kit` 3 sits beside the Nuxt 5 stack in the lockfile.

The production build was not run, so the production path is untested.

### The first blocker, fixed

With the Nuxt module installed, a page that calls `onPrehydrate` or renders Nuxt's own `NuxtTime` answers HTTP 500 with `NUXT_E1006`: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline." The first try blamed Vize for compiling Nuxt's `nuxt-time.vue` from `node_modules`, and excluding every `node_modules` component changed nothing. The newest release shows why. One `onPrehydrate` call in a component's own script fails the same way, on Nuxt 4 and on the Nuxt 5 nightly, in development and in a production build. Nuxt 3 is not affected.

Nuxt's prehydrate transform is an object hook with an id filter that the bundler checks before the handler runs. Vize's bridge changes the id that the handler receives and leaves the filter alone, so the transform never runs on a module that Vize compiled. A copy of the module with that one filter removed renders both the call and `NuxtTime`. The report is #11455, closed by `@vizejs/nuxt` 0.657.0 (#11467), which lets Nuxt's transform hook filters admit Vize modules.

### The Nuxt module's peer range stops short of Nuxt 5

The module's peer range is Nuxt 2 through 4, and the newest release keeps it. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off. It then loads and compiles every component of the app without a failure. Nuxt warns that the module imports "nitropack/runtime" through a Nitro 2 compatibility layer that Nuxt 6 removes.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. Every installed nightly of the builder still declares it. The Vize module keeps that plugin for the components Vize excludes, such as nuxt-og-image's renderers. So the package stays in the lockfile until Nuxt drops the dependency, whatever the app compiles itself.

### The library build's plugin is a Vite plugin

The library builds compile components through `unplugin-vue` in `getTsdownConfigurationVue`, which runs tsdown on rolldown. Vitest compiles through the same plugin in `getVuePlugins`. Vize's Vite plugin uses the `config`, `configResolved`, `configureServer`, `handleHotUpdate` and `apply: "build"` hooks, and rolldown does not call Vite's config hooks. The rolldown build can use only the rolldown entry of "@vizejs/unplugin". Its project lists it as a compatibility preview, and its README calls the Vite integration the most complete one. It builds components. Two behaviours that the build gets from `unplugin-vue` were gaps: `<style src>` and the TresJS elements. The first now builds for a relative path, and three other gaps remain.

The first is `<style src>`. The rolldown entry dropped the CSS of every `<style src>` block and printed no warning (#11456). Release 0.656.0 turned the silent drop into a build error (#11460), and release 0.658.0 inlines the file (#11469), so a relative `<style src>` builds. A trial of the rolldown entry in `getTsdownConfigurationVue` for `vue-phaserjs`, `genshin-interface` and `genshin-world` built all three, and found three gaps, each reported:

- #11481: a production build keeps the development output shape. The builder calls `compileSfc` without `inlineTemplate` or `isProd`, which the Vite plugin sets, so each component keeps a separate render function and its props keep runtime types.
- #11482: a package specifier in `<style src>` fails the build, in the rolldown entry and in the Vite plugin. `genshin-world` uses one to share a stylesheet from `genshin-interface`. `@vitejs/plugin-vue` resolves it. A transform hook that rewrote the specifier to the path that rolldown resolves let the build pass.
- #11483: a plain `<style>` block is injected into the JavaScript at run time, and no CSS file is written. A package loses its `style.css` and its `./style.css` export, and a server render has no component CSS. The README of the plugin documents this as a limit of the path, and #11460 states that CSS asset extraction and SSR stylesheet delivery stay unsupported. A preprocessor block, which the plugin does hand to the bundler, fails under `tsdown` with `PARSE_ERROR` on the virtual style module, where `unplugin-vue` writes `style.css`. #11483 was closed as out of scope and then reopened as a request, with an estimate of one to three days of work and the tradeoffs of an extraction option. A library build that ships a stylesheet stays on `unplugin-vue` until it is fixed, or collects the CSS another way.

The trial passed `isProduction: true` and built each package with its full configuration, so the figures below are the plugin's, with one scratch plugin for #11482 in the `genshin-world` runs.

### The rolldown plugin on the library builds, measured

Every run is a fresh process on an Apple M1 with 16 GiB, Node.js 26.13.0, `tsdown` 0.23.2 with `rolldown` 1.2.16 and `@vizejs/unplugin` 0.659.0. Cold removes `dist` and the compilers' caches first. "JS only" runs `tsdown --no-dts --no-attw --no-publint`, which times the compile and the bundle without declaration generation. "Full" is the package's own build, where `vue-tsc` writes the declarations. Medians over three cold runs and five warm runs after two priming runs; the full build is three cold runs. `unplugin-vue` ran twice, before and after the Vize runs, and the medians below combine both: the two sets differ by at most 2% on JS only and 7% on the full build. A third build, "shape fixed", is the same plugin with `inlineTemplate` and `isProd` added to its `compileSfc` options in a scratch copy, which is the change of #11481. Each cell is `unplugin-vue` / Vize / Vize with the shape fixed.

| Package             | JS only, cold        | JS only, warm        | Full build, cold        | Peak memory, JS only |
| :------------------ | :------------------- | :------------------- | :---------------------- | :------------------- |
| `vue-phaserjs`      | 0.78 / 0.79 / 0.78 s | 0.77 / 0.78 / 0.77 s | 3.83 / 3.54 / 3.51 s    | 0.4 / 0.2 / 0.2 GiB  |
| `genshin-interface` | 0.86 / 0.79 / 0.79 s | 0.85 / 0.79 / 0.79 s | 2.80 / 2.42 / 2.38 s    | 0.4 / 0.3 / 0.3 GiB  |
| `genshin-world`     | 3.84 / 2.71 / 2.56 s | 3.85 / 2.68 / 2.58 s | 19.63 / 17.31 / 16.89 s | 1.3 / 1.0 / 1.0 GiB  |

The Vize plugin uses 1.5 to 2.1 times less CPU time than `unplugin-vue` (warm, JS only: 0.97 s against 0.48 s, 1.31 s against 0.63 s and 5.63 s against 3.66 s), and it is 1.4 times faster on the largest package and no faster on the smallest. The packages are small, so the gain is a second or two, and the declaration build in the full run takes most of the time.

The output is larger. Sizes are raw bytes, with gzip at level 9 in brackets.

| Package             | Output           |      `unplugin-vue` |                Vize |         Shape fixed |
| :------------------ | :--------------- | ------------------: | ------------------: | ------------------: |
| `vue-phaserjs`      | JavaScript       |     72,469 (12,811) |     83,471 (13,660) |     71,697 (12,778) |
|                     | Change           |                     |   +15.2% (+6.6% gz) |    -1.1% (-0.3% gz) |
| `genshin-interface` | JavaScript       |    277,521 (60,530) |   527,552 (100,093) |    483,237 (96,761) |
|                     | CSS files        |    209,145 (43,401) |      12,898 (6,959) |      12,898 (6,959) |
|                     | JavaScript + CSS |   486,666 (103,931) |   540,450 (107,052) |   496,135 (103,720) |
|                     | Change           |                     |   +11.1% (+3.0% gz) |    +1.9% (-0.2% gz) |
| `genshin-world`     | JavaScript       | 3,396,781 (838,860) | 3,869,114 (917,167) | 3,716,414 (895,829) |
|                     | CSS files        |    309,445 (55,219) |               0 (0) |               0 (0) |
|                     | JavaScript + CSS | 3,706,226 (894,079) | 3,869,114 (917,167) | 3,716,414 (895,829) |
|                     | Change           |                     |    +4.4% (+2.6% gz) |    +0.3% (+0.2% gz) |

The shape makes most of the gap: 107%, 82% and 94% of it in the three packages. The component CSS that moves into the JavaScript (#11483) makes the rest, which is between 0.8 KB smaller and 10 KB larger, and each block adds about 400 bytes of injection code to its CSS. So the size is a reason to fix #11481, and it is not a reason to fix #11483. A one-component reproduction without any CSS shows the shape alone: 466 bytes from the Vize plugin against 332 bytes from the Vize Vite plugin and 373 bytes from `unplugin-vue`. The Vitest path through the Vite plugin was not tried.

The second is the TresJS elements, and it is a configuration change. The repo passes the template compiler options that "@tresjs/core" 5.10.1 ships. Its `isCustomElement` function accepts a `Tres*` or `tres-*` tag unless the tag is `TresCanvas`, `TresCanvasContext`, `TresLeches`, `TresScene` or `TresPortal`, and it accepts `primitive`. Four sites pass it: `getTsdownConfigurationVue` in the world package's build config, `getVuePlugins` in its Vitest config and in its parity page's Vite config (`packages/genshin-world/parity/vite.config.ts`), and the `tresjs-nuxt` module, which sets `vue.compilerOptions.isCustomElement` and restates the rule in `checkIsTresCustomElement`. Vize takes names and `*` patterns in `customElements`, not a function. The Vite plugin accepts `template.compilerOptions.isCustomElement` and ignores it. That was reported as #11457 and closed as configuration: the Vite plugin guide documents `customElements` with `customRenderer` for custom element tags, and it lists plugin-option parity with `@vitejs/plugin-vue` as not complete yet. The migration:

1. Replace the function with `customRenderer: true` and `customElements: ["Tres*", "primitive"]`, the recipe in the Vite plugin guide. No world component uses a `tres-` tag, so `"tres-*"` is not needed.
2. Keep `TresCanvas` and the other whitelist tags imported in each file. With `customRenderer` set, an imported tag stays a component. Compiled with both settings, the 24 world components that use a Tres tag give the same component or element for all 40 file and tag pairs, over 11 distinct tags. With `customRenderer` unset, `TresCanvas` in two files compiles as an element.
3. Import `TresCanvas` in the two app components that rely on the global registration, `apps/web/app/components/AgentConsole/Theme/Genshin/FallingStar.vue` and `apps/web/app/components/Visual/Gem/Index.vue`, because a pattern cannot exclude a name.
4. Move the Nuxt module off the function. `@vizejs/nuxt` keeps Nuxt's own compiler when it sees a predicate (#7107). This step is not run yet, and the module still fails with #11455.

The rolldown entry gives the same results as the Vite plugin for the list and pattern forms, and it rejects a function in `customElements`.

## Revisit when

Each blocker has a fix that the repo's own setup passes: the Nuxt module renders every route the trial visited with the same output as `@vitejs/plugin-vue`, an auto-imported name in a template included, and a production build passes, the module's peer range covers the Nuxt in use, Nuxt drops `@vitejs/plugin-vue` from its builder, and the rolldown entry of the Vize plugin keeps the production output shape of the Vite plugin (#11481), resolves a package specifier in `<style src>` (#11482) and writes the CSS of a plain block as a file (documented as unsupported; #11483 is open as a request), while the library builds pass with the TresJS elements settled and their output sizes are back to those of `unplugin-vue`.

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
- [Vize issue 11455](https://github.com/ubugeeei-prod/vize/issues/11455), [11456](https://github.com/ubugeeei-prod/vize/issues/11456) and [11457](https://github.com/ubugeeei-prod/vize/issues/11457) — the first three compile-side reports. 11455 and 11456 are fixed and 11457 was closed as configuration.
- [Vize issue 11481](https://github.com/ubugeeei-prod/vize/issues/11481), [11482](https://github.com/ubugeeei-prod/vize/issues/11482) and [11483](https://github.com/ubugeeei-prod/vize/issues/11483) — the gaps of the rolldown plugin in the library builds. 11481, 11482 and 11483 are open, 11483 as a request. [11484](https://github.com/ubugeeei-prod/vize/issues/11484) was closed as configuration.
