# Vize compiler

Vize compiles Vue single-file components in Rust. The library builds and Vitest compile through it ([build pipeline](../build-pipeline/design.md), "Vue components compile through Vize"), and so does the app: `@vizejs/nuxt` is in the Nuxt module list and takes the compiler's role from `@vitejs/plugin-vue`. One compiler therefore reads every `.vue` file in the repository. This page sets out the module's shape here, what it is checked against, and what it costs.

## How the module compiles

With the module registered, Vize compiles every `.vue` file that `compiler.exclude` does not name. The module hands an excluded file back to the host Vue plugin Nuxt's builder installed, so an excluded component keeps Vue's own compiler. The app names no exclusion.

```mermaid
flowchart TD
    file["A .vue file"] --> excluded{"matches compiler.exclude?"}
    excluded -- "no" --> vize["Vize compiles it"]
    excluded -- "yes" --> host["@vitejs/plugin-vue, through Nuxt's builder, compiles it"]
```

## The TresJS elements

The module takes its TresJS elements as `compiler.customElements`, the list the library builds already hand Vize (`tresCustomElements`). A `Tres*` pattern would also take `TresCanvas`, which must stay a component, so the list names each class that TresJS's own predicate keeps. `tresjs-nuxt` keeps its predicate for Nuxt's own compiler, which restates the same rule and has not moved onto the list. The module's own lint is off, because the repository's lint is oxlint and ESLint.

## What holds

- **Dev.** With the module registered, the dev server answers `/`, `/about`, `/clicker`, `/fluid-simulator` and `/login` with status 200 and no `NUXT_E1006`, and Chrome mounts each; `/about` logs no hydration error, where the `new` form compiles to a member access. The first request after a cold start logs an outdated-optimised-dependency error until Vite re-optimises, as it does without the module. The dev server logs no "NUXT_B9003": the module's peer range covers the Nuxt the app runs, and its dev stylesheet plugin still imports `nitropack/runtime`, which the app's tree does not resolve, so the warning is silent rather than the import removed.
- **Server HTML.** On every public route it is the baseline's, with attribute order, nonces, integrity hashes, hashed asset names, scope ids and the page's own origin normalised. `/about` renders the canvas's own `<span>` with its attributes: `TresCanvas` is registered as a client file and a server file, and the server render takes the server registration ([ubugeeei-prod/vize#11757](https://github.com/ubugeeei-prod/vize/issues/11757)). The one difference is a `modulepreload` hint `/login` carries without the module, which follows the chunk graph.
- **Production client.** It mounts on every public route with no page error, `/about` included, where an inline template's `new` on an imported binding compiles to a call the constructor can run. The console messages of each route are the baseline's. No client chunk imports a bare `vue` specifier ([ubugeeei-prod/vize#11793](https://github.com/ubugeeei-prod/vize/issues/11793)), and the server output imports it bare only from files the baseline's does, from `node_modules`.
- **Compilation.** The production build compiles every `.vue` file through the module with none failing, and props types imported from `@esposter/db-schema`, a private package that emits no declarations, resolve. `/clicker` renders in full and its cocktail counts a click as the baseline's does. Its SVG group carries the `class` and `cursor` its component passes as `gAttrs`, and props typed through the `@/` alias resolve ([ubugeeei-prod/vize#11794](https://github.com/ubugeeei-prod/vize/issues/11794)).

## What it costs

A clean production build takes longer with the module than without it. The client bundle takes as long as before; the extra time is in the server bundle, where the plugin's per-file component transform dominates the build's profile. The module claims no gain in build time. The server bundle's cost is the transform hook compiling one component per native call, which `@vizejs/native` made slower from the release that resolves imported props types through the project's configuration; the plugin pre-compiles only the client environment in one batch, which is not affected ([Vize issue 12044](https://github.com/ubugeeei-prod/vize/issues/12044)). `@nuxt/vite-builder` depends on `@vitejs/plugin-vue` unconditionally and no Nuxt option turns it off, so the package stays in the lockfile until Nuxt drops the dependency, and the module keeps it for any component `compiler.exclude` names: that costs an install and changes no behaviour.

## Checking a bump

`vize`, `@vizejs/native`, `@vizejs/nuxt`, `@vizejs/unplugin` and `@vizejs/vite-plugin` pin one another and move as one Renovate group. A bump of the group re-runs the check against the baseline. It builds the app with and without the module, serves each output against a database, and compares the parsed server HTML of every public route after the normalisation above. It then loads every public route in Chromium, compares console errors and page errors, and clicks the `/clicker` cocktail in both. Bare `vue` specifiers are counted in every client chunk, since a directory count also includes chunks of other builds, so a count that compares two builds starts from a clean `.output` and a clean Nuxt build cache. A build served from a copy of `.output` needs the app's `node_modules` reachable from the copy, or the rate limiter's `drizzle-orm` import fails and `/clicker` shows its error screen in both. In a sandbox that cannot reach the font providers, `@nuxt/fonts` is left out of both builds.

## Key files

| File                                                            | Role                                                                        |
| :-------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `apps/web/configuration/modules.ts`                             | the Nuxt module list, where the Vize module registers                       |
| `apps/web/app/components/Visual/Gem/Index.vue`                  | the component whose inline template holds the `new` form `/about` exercises |
| `packages/genshin-world/scripts/tres/tresCustomElements.ts`     | the element names the library builds hand Vize, which the module takes too  |
| `packages/tresjs-nuxt/src/services/checkIsTresCustomElement.ts` | the TresJS predicate the Nuxt module sets for Nuxt's own compiler           |
| `packages/db-schema/package.json`                               | the private package, with no declarations, whose props types must resolve   |
| `renovate.json`                                                 | the rule that groups the Vize packages into one bump                        |
| `pnpm-workspace.yaml`                                           | the `vize` and `@vizejs/*` catalog entries                                  |

## Sources

- [Vize repository](https://github.com/ubugeeei-prod/vize) — the repository of `@vizejs/nuxt`; the peer range comes from its npm metadata.
- [Vize issue 11757](https://github.com/ubugeeei-prod/vize/issues/11757) — the server registration of a component registered for both client and server, which `/about`'s canvas depends on. Closed as completed.
- [Vize issue 11793](https://github.com/ubugeeei-prod/vize/issues/11793) — bare `vue` imports in the Nuxt 5 client, which the client check depends on. Closed as completed.
- [Vize issue 11794](https://github.com/ubugeeei-prod/vize/issues/11794) — `defineProps` through a tsconfig alias, which the `/clicker` SVG group depends on. Closed as completed.
- [Vize issue 11795](https://github.com/ubugeeei-prod/vize/issues/11795) — the `nitropack/runtime` import behind "NUXT_B9003", and the peer range. Closed as completed.
- [Vize issue 12044](https://github.com/ubugeeei-prod/vize/issues/12044) — the per-file `compileSfc` cost behind "What it costs". Open.
