# Vize compiler

Vize compiles Vue single-file components in Rust. The library builds and Vitest compile through it already ([build pipeline](../../../specs/architecture/build-pipeline/design.md), "Vue components compile through Vize"), and the app is what stays deferred: Nuxt compiles it through `@vitejs/plugin-vue`, and Vize's Nuxt module, `@vizejs/nuxt`, was tried in its place and taken back out. A trial of 0.657.0, a re-run of 0.662.0 and a production-build run of 0.676.0 over the same nine routes found the blockers below. The defects of the first two runs were reduced to standalone projects and filed on the Vize repository. The three gaps of the third run are reduced the same way and filed too, as [#11793](https://github.com/ubugeeei-prod/vize/issues/11793), [#11794](https://github.com/ubugeeei-prod/vize/issues/11794) and [#11795](https://github.com/ubugeeei-prod/vize/issues/11795).

## Blockers

### The production client imports `vue` as a bare specifier

The production build passes with the module and takes about a fifth less wall-clock than the baseline's, from one run each, and every route answers 200. The client it writes does not run. Of the chunks the entry loads statically, about a third import Vue as `import{…}from"vue"`, which a browser cannot resolve, so each route logs `Failed to resolve module specifier "vue"` and never hydrates. The baseline's entry loads the same number of chunks and none imports a bare specifier. Vue's own core is bundled into the module build's entry chunk as well, so the bare imports are an inconsistent split, and mapping `vue` to a browser build would give the page two copies of Vue and not a working client. The server entry keeps an `import "vue"` as well, with no Vue traced into the output beside it, so the output starts only where a `node_modules` holding Vue sits above it. The cause is the module's `vite:extendConfig` hook. It writes `vue` into the SSR build's `external` list on the config object it receives, and the Nuxt 5 builder hands both environments a shallow copy of one config, so the client build reads the same list. A standalone project reproduces it with one component, and writing the list on the SSR environment's own build options, in a private copy of the module, gives a client that runs. The same project on Nuxt 4 writes no bare import. The module declares Nuxt 2 through 4 and the repo runs the Nuxt 5 nightly, which the peer-range section below covers. It is filed as [#11793](https://github.com/ubugeeei-prod/vize/issues/11793).

The same fact makes every hydration result of this run void: a route that never hydrates logs no mismatch. Screenshots show the same thing. The module build's `/dungeons` is a blank page where the baseline draws its dock and game canvas, `/anime` stays on its loading skeleton, and `/clicker` shows its static page. The baseline's `/clicker` and `/anime` show their error pages in a sandbox with no database, because its client runs and its queries fail, so a clean-looking page there only means the client never started. A re-trial loads each route in a browser against a backend, since the server HTML alone matched while the client was broken.

The build output also keeps the hashed chunks of earlier builds, so a count over the output directory mixes builds: a chunk is counted only when the entry loads it, which a walk over its static imports decides.

### The module compiles templates differently from Vue's compiler

With the module, every route answers 200. The earlier reports, #11592, #11593 and #11594, are closed as completed on the Vize repository, and two of their fixes show in the output: `/anime` and `/clicker`'s title render the same server document as `@vitejs/plugin-vue`. That is a comparison of the parsed documents with attribute and class order normalised and comment nodes kept, so it says nothing of the client. `/dungeons` renders on the client, so its server document is the same shell with or without the module, and nothing here can show the fix to #11592 while the client does not start. Two routes still differ:

| Route      | What differs                                                                                                                                                                 | Cause                                                                                                                                                                                                                                                                 |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/clicker` | The SVG group of the click target loses the `class` and `cursor` that `Clicker/Content.vue` passes as `gAttrs`; three fragment marker pairs are missing from the server HTML | The component's props type is imported through `@/`, which the compiler resolves only beside a folder named `src`, and the app's folder is `app`, so the component gets no `props` option and its `gAttrs` is no prop. The missing fragment markers are not explained |
| `/about`   | Where the baseline server-renders an empty `<span>` carrying the canvas's attributes, the module leaves a `<!--placeholder-->`                                               | See the TresJS section below                                                                                                                                                                                                                                          |

A search of the Vize repository's issues by symptom turned up no report of the bare `vue` imports, of the `NUXT_B9003` warning or of the alias import; the nearest issues are named in each report. The alias import is filed as [#11794](https://github.com/ubugeeei-prod/vize/issues/11794): the compiler resolves no tsconfig `paths` entry, and no release back to 0.640.0 does. The `/about` difference has no draft, since it has no reduction. The baseline logs a hydration mismatch on `/clicker`, so the module does not cause that one. The first blocker of the earliest trial, `onPrehydrate` answering 500 with `NUXT_E1006`, is fixed in `@vizejs/nuxt` 0.657.0 (#11455).

### The module's peer range stops short of Nuxt 5

The peer range is Nuxt 2 through 4. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off, then loads and compiles every component. It depends on a Nuxt 3 `@nuxt/kit` of its own beside the repo's, and its dev plugin imports `nitropack/runtime`, a Nitro 2 package that Nuxt 5 replaced with `nitro`, so Nuxt logs `NUXT_B9003` in development; a standalone project on 0.676.0 shows it, and importing `definePlugin` from `nitro` in a private copy removes it. That is a compatibility request and not a crash. It is filed as [#11795](https://github.com/ubugeeei-prod/vize/issues/11795).

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. The module keeps that plugin for the components it excludes, such as nuxt-og-image's renderers, so the package stays in the lockfile until Nuxt drops the dependency.

### The TresJS elements are configuration

`/about` leaves a `<!--placeholder-->` where the baseline server-renders an empty `<span>` carrying the canvas's attributes. The earlier runs traced the difference to the explicit `TresCanvas` import bypassing the client wrapper `tresjs-nuxt` registers; that cause was not re-checked on 0.676.0. The module keeps Nuxt's own compiler when it is handed a predicate (#7107), and Vize takes names and `*` patterns, not a function. The fix is the list the library builds already use, `tresCustomElements`, which names every `Tres` class except the components `@tresjs/core` itself excludes, so `TresCanvas` stays a component. A `Tres*` pattern cannot leave those out. The `tresjs-nuxt` module restates the rule in `checkIsTresCustomElement`, and moving it onto the list is not run yet.

## Revisit when

A production build with the module writes a client that runs, with no bare `vue` import in any chunk or in the server entry. The module's peer range covers the Nuxt in use, its output matches `@vitejs/plugin-vue`'s on `/clicker` and `/about`, and Nuxt drops `@vitejs/plugin-vue` from its builder.

A re-trial builds the app twice, with and without the module, serves each output and compares the parsed documents of the nine routes, then loads every route in Chromium and compares the console warnings and errors. The two builds must sit where `vue` resolves for both. In a sandbox that cannot reach the font providers, `@nuxt/fonts` is left out of both builds.

## Key files

| File                                                            | Role                                                                                    |
| :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| `apps/web/configuration/modules.ts`                             | the Nuxt module list, where the Vize module was added and taken back out                |
| `packages/genshin-world/scripts/tres/tresCustomElements.ts`     | the element names the library builds hand Vize, which the module must be given too      |
| `packages/tresjs-nuxt/src/services/checkIsTresCustomElement.ts` | the TresJS predicate the Nuxt module sets, which the module would replace with the list |
| `pnpm-workspace.yaml`                                           | the `vize` and `@vizejs/*` catalog entries                                              |

## Sources

- [Vize repository](https://github.com/ubugeeei-prod/vize) — the repository of `@vizejs/nuxt`, from its npm metadata, which gives the peer range the blockers cite.
- [Vize issue 11455](https://github.com/ubugeeei-prod/vize/issues/11455) — the `onPrehydrate` report, fixed by `@vizejs/nuxt` 0.657.0.
