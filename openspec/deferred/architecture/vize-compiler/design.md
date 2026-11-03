# Vize compiler

Vize compiles Vue single-file components in Rust. Its Nuxt module was tried in the app in place of `@vitejs/plugin-vue` and failed on the repo's own setup, so it was taken back out. A second look at the newest release ran its Nuxt module, its Vite plugin and its rolldown plugin on small standalone projects, and every blocker below still holds. Each one was reduced to an issue on the Vize repository. The Nuxt blocker, #11455, is fixed in `@vizejs/nuxt` 0.657.0, and a trial of that release in the app found others (below). #11456 is fixed in `@vizejs/unplugin` 0.658.0, and a trial of that plugin in the library builds found three more gaps (below): #11481 and #11482 are fixed in 0.661.0, and #11483 is fixed in 0.664.0 (#11523). #11457 was closed as configuration. The library builds and Vitest have compiled through Vize since 3 November, on 0.664.0; the app keeps the Vue plugin that Nuxt's builder brings.

## Blockers

### The Nuxt module compiles templates without Nuxt's template auto-imports

A trial of `@vizejs/nuxt` 0.657.0 in the app, beside the same app on `@vitejs/plugin-vue`, rendered every public route with status 200 and no `NUXT_E1006`, and the `onPrehydrate` callback of a probe page is serialised into its HTML. It also changed what some routes do:

- `/dungeons` throws `TypeError: _ctx.unref is not a function` while it renders, from seven templates that call `unref` on a grid's nested ref in a `v-for` or a prop (`apps/web/app/components/Dungeons`). Nuxt resolves an auto-imported name in a template for `@vitejs/plugin-vue`'s output, and Vize's output is not resolved the same way. The page draws nothing of its menu, which is an 85% pixel difference from the baseline. Any template that calls an auto-imported function is open to the same failure, and only the routes the trial visited were exercised.
- `/clicker` loses its title: `<Title>` received more than one child, and the page's `<title>` and `og:title` lose the text after the interpolation.
- `/anime` gains a hydration mismatch that the baseline does not log.
- `/about` server-renders a `<canvas data-tres>` where the baseline renders an empty element, because the explicit `TresCanvas` import of the migration below bypasses the client wrapper that `tresjs-nuxt` registers.
- Nuxt warns `NUXT_B9003` that the module imports `nitropack/runtime` through a Nitro 2 layer that Nuxt 6 removes, and the module's own `@nuxt/kit` 3 sits beside the Nuxt 5 stack in the lockfile.

The trial was run again on 0.662.0, the newest release on 3 November, in a fresh worktree over the same nine routes, and every point above reproduces. `/dungeons` logs the same three `_ctx.unref` errors, the server-rendered `/clicker` title is still "Esposter | 0.000" where the baseline's is "Esposter | 0.000 Piña Coladas" (the dev log prints `NUXT_E6002` for it, and the baseline log does not), `/anime` logs the hydration mismatch, `/about` still server-renders the `<canvas data-tres>`, and the install reports the unmet peer on Nuxt 5 and the dev log `NUXT_B9003`. All nine routes still answer 200 with no page error, and the console error counts match the 0.657.0 run on every route. None of the four page problems is in the tracker yet (a search for the symptoms finds only #11455), so each needs a reduction before it is filed. They are template and server-render problems and not CSS ones: the stylesheet gap of the library builds (#11483) is the compile-side CSS issue, and it does not reach the app.

The production build was not run, so the production path is untested.

### The first blocker, fixed

With the Nuxt module installed, a page that calls `onPrehydrate` or renders Nuxt's own `NuxtTime` answers HTTP 500 with `NUXT_E1006`: "To transform a callback into a string, `onPrehydrate` must be processed by the Nuxt build pipeline." The first try blamed Vize for compiling Nuxt's `nuxt-time.vue` from `node_modules`, and excluding every `node_modules` component changed nothing. The newest release shows why. One `onPrehydrate` call in a component's own script fails the same way, on Nuxt 4 and on the Nuxt 5 nightly, in development and in a production build. Nuxt 3 is not affected.

Nuxt's prehydrate transform is an object hook with an id filter that the bundler checks before the handler runs. Vize's bridge changes the id that the handler receives and leaves the filter alone, so the transform never runs on a module that Vize compiled. A copy of the module with that one filter removed renders both the call and `NuxtTime`. The report is #11455, closed by `@vizejs/nuxt` 0.657.0 (#11467), which lets Nuxt's transform hook filters admit Vize modules.

### The Nuxt module's peer range stops short of Nuxt 5

The module's peer range is Nuxt 2 through 4, and the newest release keeps it. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off. It then loads and compiles every component of the app without a failure. Nuxt warns that the module imports "nitropack/runtime" through a Nitro 2 compatibility layer that Nuxt 6 removes.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. Every installed nightly of the builder still declares it. The Vize module keeps that plugin for the components Vize excludes, such as nuxt-og-image's renderers. So the package stays in the lockfile until Nuxt drops the dependency, whatever the app compiles itself.

### The library build's plugin is a Vite plugin

Until 3 November the library builds compiled components through `unplugin-vue` in `getTsdownConfigurationVue`, which runs tsdown on rolldown, and Vitest compiled through the same plugin in `getVuePlugins`. Both now run Vize: the rolldown entry for the builds and the Vite entry for Vitest. Vize's Vite plugin uses the `config`, `configResolved`, `configureServer`, `handleHotUpdate` and `apply: "build"` hooks, and rolldown does not call Vite's config hooks. The rolldown build can use only the rolldown entry of "@vizejs/unplugin". Its project lists it as a compatibility preview, and its README calls the Vite integration the most complete one. It builds components. Two behaviours that the build gets from `unplugin-vue` were gaps: `<style src>` and the TresJS elements. The first now builds for a relative path, and three other gaps were found: two are fixed in 0.661.0 and the third is fixed in 0.664.0, as listed below.

The first is `<style src>`. The rolldown entry dropped the CSS of every `<style src>` block and printed no warning (#11456). Release 0.656.0 turned the silent drop into a build error (#11460), release 0.658.0 inlines the file (#11469), and release 0.661.0 resolves a package specifier through the bundler (#11492). A trial of the rolldown entry in `getTsdownConfigurationVue` for `vue-phaserjs`, `genshin-interface` and `genshin-world` built all three on 0.659.0 and found three gaps, each reported. Two are fixed in 0.661.0, and the trial was re-run on that release:

- #11481, fixed by #11488: a production build kept the development output shape. The builder called `compileSfc` without `inlineTemplate` or `isProd`, which the Vite plugin sets, so each component kept a separate render function and its props kept runtime types.
- #11482, fixed by #11492: a package specifier in `<style src>` failed the build, in the rolldown entry and in the Vite plugin. `genshin-world` uses one to share a stylesheet from `genshin-interface`, and `@vitejs/plugin-vue` resolves it. On 0.661.0 the build passes with no scratch plugin and without the `<style src>` workaround that `unplugin-vue` needs.
- #11483, closed as completed on main by #11523 and not in a release yet (0.662.0 does not hold it): a plain `<style>` block is injected into the JavaScript at run time, and no CSS file is written. A package loses its `style.css` and its `./style.css` export, and a server render has no component CSS. The README of the plugin documents this as a limit of the path, and #11460 states that CSS asset extraction and SSR stylesheet delivery stay unsupported. A preprocessor block, which the plugin does hand to the bundler, fails under `tsdown` with `PARSE_ERROR` on the virtual style module, where `unplugin-vue` writes `style.css`. #11483 was closed as out of scope and then reopened as a request, with an estimate of one to three days of work and the tradeoffs of an extraction option. #11523 hands every block to the bundler's CSS pipeline, so `tsdown` with `@tsdown/css` writes `style.css` as `unplugin-vue` does, and a build with no CSS pipeline fails on the first style block. The library builds moved to 0.664.0, the release that holds it, on 3 November; the sizes and timings below were measured on 0.661.0, before that.

The trial passed `isProduction: true` and built each package with its full configuration, so the figures below are the stock plugin's.

### The rolldown plugin on the library builds, measured

Every run is a fresh process on an Apple M1 with 16 GiB, `tsdown` 0.23.2 with `rolldown` 1.2.16 and `@vizejs/unplugin` 0.661.0. Cold removes `dist` and the compilers' caches first. "JS only" runs `tsdown --no-dts --no-attw --no-publint`, which times the compile and the bundle without declaration generation. "Full" is the package's own build, where `vue-tsc` writes the declarations. Medians over three cold runs and five warm runs after two priming runs; the full build is three cold runs. A second set of runs, taken on a machine that waited to be idle before each batch, agrees with the first within 5% on every median except 4 cells, which were slower while I worked on the machine; the benchmark comment lists them. Every run, the scripts and the patch that swaps the plugin are in [the benchmark comment on the maintainer's performance issue](https://github.com/ubugeeei-prod/vize/issues/10936#issuecomment-6592116514).

| Target              | Build           | JS only, cold | JS only, warm | Full build, cold |         Faster than `unplugin-vue` |
| :------------------ | :-------------- | ------------: | ------------: | ---------------: | ---------------------------------: |
| `vue-phaserjs`      | `unplugin-vue`  |        0.79 s |        0.76 s |           3.63 s |                                    |
|                     | Rolldown plugin |        0.78 s |        0.79 s |           3.51 s | 1.01x cold, 0.96x warm, 1.03x full |
| `genshin-interface` | `unplugin-vue`  |        0.85 s |        0.84 s |           2.77 s |                                    |
|                     | Rolldown plugin |        0.79 s |        0.79 s |           2.42 s | 1.08x cold, 1.06x warm, 1.14x full |
| `genshin-world`     | `unplugin-vue`  |        3.83 s |        3.72 s |          18.64 s |                                    |
|                     | Rolldown plugin |        2.55 s |        2.56 s |          16.98 s | 1.50x cold, 1.45x warm, 1.10x full |

| Target              | Build           | CPU time, JS only, warm | Peak memory, JS only | Less CPU than `unplugin-vue` |
| :------------------ | :-------------- | ----------------------: | -------------------: | ---------------------------: |
| `vue-phaserjs`      | `unplugin-vue`  |                  0.96 s |              0.4 GiB |                              |
|                     | Rolldown plugin |                  0.48 s |              0.2 GiB |                        2.00x |
| `genshin-interface` | `unplugin-vue`  |                  1.30 s |              0.4 GiB |                              |
|                     | Rolldown plugin |                  0.60 s |              0.3 GiB |                        2.17x |
| `genshin-world`     | `unplugin-vue`  |                  5.43 s |              1.3 GiB |                              |
|                     | Rolldown plugin |                  3.52 s |              1.0 GiB |                        1.54x |

The Vize plugin uses 1.5x to 2.2x less CPU time than `unplugin-vue` (warm, JS only), and it is 0.96x to 1.45x as fast on a warm JS-only build: no faster on the smallest package and 1.45 times as fast on the largest. The packages are small, so the gain is a second or two, and the declaration build in the full run takes most of the time.

The output differs by -1.1% to +1.9%. Sizes are raw bytes, with gzip at level 9 in brackets.

| Target              | Build           |          JavaScript |        CSS files |               Total | Larger than `unplugin-vue` |
| :------------------ | :-------------- | ------------------: | ---------------: | ------------------: | -------------------------: |
| `vue-phaserjs`      | `unplugin-vue`  |     72,469 (12,811) |            0 (0) |     72,469 (12,811) |                            |
|                     | Rolldown plugin |     71,697 (12,778) |            0 (0) |     71,697 (12,778) |              -1.1% (-0.3%) |
| `genshin-interface` | `unplugin-vue`  |    277,521 (60,530) | 209,145 (43,401) |   486,666 (103,931) |                            |
|                     | Rolldown plugin |    483,237 (96,761) |   12,898 (6,959) |   496,135 (103,720) |              +1.9% (-0.2%) |
| `genshin-world`     | `unplugin-vue`  | 3,396,781 (838,860) | 309,445 (55,219) | 3,706,226 (894,079) |                            |
|                     | Rolldown plugin | 3,716,414 (895,826) |            0 (0) | 3,716,414 (895,826) |              +0.3% (+0.2%) |

What is left of the difference is mostly the CSS of plain `<style>` blocks that moves into the JavaScript (#11483): the JavaScript grows by about what the CSS files lose, and `vue-phaserjs`, which has no CSS, is smaller. The figures are to be taken again on 0.664.0, the release that holds #11523, where the CSS files come back. The Vitest path through the Vite plugin was not tried.

The second is the TresJS elements, and it is a configuration change. The repo passes the template compiler options that "@tresjs/core" 5.10.1 ships. Its `isCustomElement` function accepts a `Tres*` or `tres-*` tag unless the tag is `TresCanvas`, `TresCanvasContext`, `TresLeches`, `TresScene` or `TresPortal`, and it accepts `primitive`. Four sites pass it: `getTsdownConfigurationVue` in the world package's build config, `getVuePlugins` in its Vitest config and in its parity page's Vite config (`packages/genshin-world/parity/vite.config.ts`), and the `tresjs-nuxt` module, which sets `vue.compilerOptions.isCustomElement` and restates the rule in `checkIsTresCustomElement`. Vize takes names and `*` patterns in `customElements`, not a function. The Vite plugin accepts `template.compilerOptions.isCustomElement` and ignores it. That was reported as #11457 and closed as configuration: the Vite plugin guide documents `customElements` with `customRenderer` for custom element tags, and it lists plugin-option parity with `@vitejs/plugin-vue` as not complete yet. The migration:

1. Replace the function with `customRenderer: true` and `customElements: ["Tres*", "primitive"]`, the recipe in the Vite plugin guide. No world component uses a `tres-` tag, so `"tres-*"` is not needed.
2. Keep `TresCanvas` and the other whitelist tags imported in each file. With `customRenderer` set, an imported tag stays a component. Compiled with both settings, the 24 world components that use a Tres tag give the same component or element for all 40 file and tag pairs, over 11 distinct tags. With `customRenderer` unset, `TresCanvas` in two files compiles as an element.
3. Import `TresCanvas` in the two app components that rely on the global registration, `apps/web/app/components/AgentConsole/Theme/Genshin/FallingStar.vue` and `apps/web/app/components/Visual/Gem/Index.vue`, because a pattern cannot exclude a name.
4. Move the Nuxt module off the function. `@vizejs/nuxt` keeps Nuxt's own compiler when it sees a predicate (#7107). This step is not run yet. It is to be tried on `@vizejs/nuxt` 0.657.0 or later, where #11455 is fixed, and the Nuxt blockers above are what that trial must clear.

The rolldown entry gives the same results as the Vite plugin for the list and pattern forms, and it rejects a function in `customElements`.

## Revisit when

Each blocker has a fix that the repo's own setup passes: the Nuxt module renders every route the trial visited with the same output as `@vitejs/plugin-vue`, an auto-imported name in a template included, and a production build passes, the module's peer range covers the Nuxt in use, Nuxt drops `@vitejs/plugin-vue` from its builder, and a release holds the rolldown entry's CSS pipeline (#11523, which closed #11483 on main) so that the library builds, measured again on it, write `style.css`, keep their output sizes at those of `unplugin-vue` and pass with the TresJS elements settled. The production output shape (#11481) and the package specifier in `<style src>` (#11482) are already in 0.661.0.

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
- [Vize issue 11481](https://github.com/ubugeeei-prod/vize/issues/11481), [11482](https://github.com/ubugeeei-prod/vize/issues/11482) and [11483](https://github.com/ubugeeei-prod/vize/issues/11483) — the gaps of the rolldown plugin in the library builds. 11481 and 11482 are fixed in 0.661.0, and 11483 is closed by [pull request 11523](https://github.com/ubugeeei-prod/vize/pull/11523), which is on main and in no release yet. [11484](https://github.com/ubugeeei-prod/vize/issues/11484) was closed as configuration.
