# Vize compiler

Vize compiles Vue single-file components in Rust. The library builds and Vitest compile through it already ([build pipeline](../../../specs/architecture/build-pipeline/design.md), "Vue components compile through Vize"), and the app is what stays deferred: Nuxt compiles it through `@vitejs/plugin-vue`, and Vize's Nuxt module, `@vizejs/nuxt`, was tried in its place and taken back out. A trial of 0.657.0 and a re-run of 0.662.0 over the same nine routes found the blockers below. Each one that is a defect was reduced to a standalone project and filed on the Vize repository, as the table says.

## Blockers

### The module compiles templates differently from Vue's compiler

With the module, every route answers 200. Three of them behave differently from the same app on `@vitejs/plugin-vue`:

| Route       | What differs                                                                                                                                                         | Cause                                                                                                                                           | Issue  |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :----- |
| `/dungeons` | `TypeError: _ctx.unref is not a function` from seven templates that call `unref` on a grid's nested ref (`apps/web/app/components/Dungeons`); the page draws no menu | The bridge rewrites the module id, so Nuxt's auto-import transform skips it. Any template that calls an auto-import is open to the same failure | #11592 |
| `/clicker`  | `<Title>` receives more than one child (`NUXT_E6002`), and the page's `<title>` and `og:title` lose the text after the interpolation                                 | Server rendering splits adjacent text and interpolation into separate vnodes, where Vue's compiler merges them                                  | #11593 |
| `/anime`    | A hydration mismatch the baseline does not log                                                                                                                       | A template comment directly inside `<Transition>` stays in the server HTML, where Vue's compiler removes it                                     | #11594 |

The `/clicker` and `/genshin` hydration mismatches also appear on the baseline, so the module does not cause them. The production build was not run, so the production path is untested. The first blocker of the trial, `onPrehydrate` answering 500 with `NUXT_E1006`, is fixed in `@vizejs/nuxt` 0.657.0 (#11455).

### The module's peer range stops short of Nuxt 5

The peer range is Nuxt 2 through 4. The repo runs the Nuxt 5 nightly, where the module installs only with the peer check off, then loads and compiles every component. Nuxt logs `NUXT_B9003` because the dev plugin imports `nitropack/runtime`, a Nitro 2 package that Nuxt 5 replaced with `nitro`. It is a compatibility request and not a crash, so no issue is filed for it.

### Nuxt's builder keeps the Vue plugin installed

`@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally, and no Nuxt option turns it off. The module keeps that plugin for the components it excludes, such as nuxt-og-image's renderers, so the package stays in the lockfile until Nuxt drops the dependency.

### The TresJS elements are configuration

`/about` server-renders a `<canvas data-tres>` where the baseline renders an empty element, because the explicit `TresCanvas` import bypasses the client wrapper `tresjs-nuxt` registers. The module keeps Nuxt's own compiler when it is handed a predicate (#7107), and Vize takes names and `*` patterns, not a function. The fix is the list the library builds already use, `tresCustomElements`, which names every `Tres` class except the components `@tresjs/core` itself excludes, so `TresCanvas` stays a component. A `Tres*` pattern cannot leave those out. The `tresjs-nuxt` module restates the rule in `checkIsTresCustomElement`, and moving it onto the list is not run yet.

## Revisit when

A release resolves an auto-imported name in a template, merges adjacent text and drops a comment inside `<Transition>`, and a production build passes with the module. The module's peer range covers the Nuxt in use, and Nuxt drops `@vitejs/plugin-vue` from its builder.

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
