# Vize compiler

Vize compiles Vue single-file components in Rust. The library builds and Vitest compile through it already ([build pipeline](../../../specs/architecture/build-pipeline/design.md), "Vue components compile through Vize"), and the app is what stays deferred: Nuxt compiles it through `@vitejs/plugin-vue`, and Vize's Nuxt module, `@vizejs/nuxt`, was tried in its place and taken back out. A trial of 0.657.0, a re-run of 0.662.0 and a production-build run of 0.676.0 over the same nine routes found the blockers below. The defects of the first two runs were reduced to standalone projects and filed on the Vize repository, as the table says.

## Blockers

### The production client imports `vue` as a bare specifier

The production build passes with the module and takes about a fifth less wall-clock than the baseline's, from one run each, and every route answers 200. The client it writes does not run. Well over a hundred client chunks import Vue as `import{…}from"vue"`, which a browser cannot resolve, so each route logs `Failed to resolve module specifier "vue"` and never hydrates, where the baseline's client carries no bare import. The server entry keeps an `import "vue"` as well, with no Vue traced into the output beside it, so the output starts only where a `node_modules` holding Vue sits above it. The cause was not isolated. The module declares Nuxt 2 through 4 and the repo runs the Nuxt 5 nightly, which the peer-range section below covers.

The same fact makes every hydration result of this run void: a route that never hydrates logs no mismatch. A re-trial loads each route in a browser, since the server HTML alone matched while the client was broken.

### The module compiles templates differently from Vue's compiler

With the module, every route answers 200. The three routes that differed in the earlier runs now render the same document as `@vitejs/plugin-vue` (`/dungeons`, `/anime`, and `/clicker`'s title). That is a comparison of the parsed server documents with attribute and class order normalised and comment nodes kept, so it says nothing of the client. The earlier reports, #11592, #11593 and #11594, no longer show in the output, and their states on the Vize repository were not read. Two routes still differ:

| Route      | What differs                                                                                                                                                                 | Cause                                                                                                                                                                                     |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/clicker` | The SVG group of the click target loses the `class` and `cursor` that `Clicker/Content.vue` passes as `gAttrs`; three fragment marker pairs are missing from the server HTML | Not isolated. Each component that forwards `gAttrs` compiles to the same `mergeProps` output as `v-bind` when built alone, with its props type written inline where the app's is imported |
| `/about`   | Where the baseline server-renders an empty `<span>` carrying the canvas's attributes, the module leaves a `<!--placeholder-->`                                               | See the TresJS section below                                                                                                                                                              |

The baseline logs a hydration mismatch on `/clicker`, so the module does not cause that one. The first blocker of the earliest trial, `onPrehydrate` answering 500 with `NUXT_E1006`, is fixed in `@vizejs/nuxt` 0.657.0 (#11455).

### The module's peer range stops short of Nuxt 5

The peer range is Nuxt 2 through 4. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off, then loads and compiles every component. It depends on a Nuxt 3 `@nuxt/kit` of its own beside the repo's, and its dev plugin imports `nitropack/runtime`, a Nitro 2 package that Nuxt 5 replaced with `nitro`, so Nuxt logged `NUXT_B9003` in development in the earlier runs; the latest run built for production and did not start the dev server. That is a compatibility request and not a crash, so no issue is filed for it.

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
