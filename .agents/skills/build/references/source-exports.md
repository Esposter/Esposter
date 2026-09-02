# Self-alias and source exports

Read when a package imports its own source, when a specifier has to survive being bundled by a sibling, or when deciding what the `source` export condition reaches. This page holds the whole rule; `SKILL.md` keeps the `Settled` lines that stop the two rejected variants being re-proposed.

## Self-alias with `#src/`, not `@/`

A package refers to its own source through **Node subpath imports**, declared in its own manifest:

```json
{ "imports": { "#src/*": "./src/*.ts" } }
```

```ts
import { escapeValue } from "#src/services/transformer/escapeValue";
```

**Four details are load-bearing:**

- **The extension goes in the target, not the specifier.** Nothing here does extension substitution through an `imports` target: given `"./src/*"`, TypeScript computes `./src/services/transformer/escapeValue`, finds no such file, and reports the module missing. Carrying `.ts` on every specifier also fixes it, and is the wrong fix — the pattern substitutes into `./src/*.ts`, so one line in the manifest does what hundreds of edits would, and specifiers stay extensionless like everything else in the repo.
- **One key per extension the package self-imports.** `./src/*.ts` is the default arm, not a claim that a package only ever holds `.ts`. A package that self-imports something else adds a key whose suffix says so, and the longer suffix wins the match:

  ```json
  { "imports": { "#src/*": "./src/*.ts", "#src/*.vue": "./src/*.vue" } }
  ```

  Those specifiers keep their own extension — `#src/components/Container.vue` — which is what a `.vue` or `.json` import carries anyway. Don't reach for an **array** target (`["./src/*.ts", "./src/*.vue"]`) to avoid the second key: TypeScript walks the fallbacks, Vite does not, so it typechecks and then fails to resolve under Vitest.

- **The key cannot be `#/`.** Node reserves that shape, and `#src/*` is the closest legal spelling to the `@/*` it replaces.
- **A directory is not a specifier.** `paths` resolved `@/store` by directory lookup to `src/store/index.ts`; `#src/store` substitutes to the literal `./src/store.ts` and nothing else, so a directory has to be named as `#src/store/index`. Where both exist — `db-schema` has `src/schema.ts` **and** `src/schema/` — the file is what `@/schema` used to mean, so it stays `#src/schema` and only the barrel takes the `/index`. Getting that one backwards leaves the specifier unresolved, and rolldown reports it as an _external_ import the `onlyImport` gate rejects, naming a package that has nothing to do with it.

`@/*` was a `paths` entry, which is resolved by whichever tsconfig drives the _current compilation_ — so the moment a sibling bundles the package from source, `@/models/Clause` re-points into the bundling package and resolves to nothing. A `#` specifier is resolved by walking up to the nearest `package.json`, which is the one owning the importing **file**, so it survives. That is not a tooling gap to wait out: `paths` is a compiler fiction with no runtime meaning, and no configuration makes it survive. `imports` is in the Node ESM specification, implemented by Node, TypeScript, Rolldown, Vite, esbuild, webpack, Vitest and jiti alike, and it is private to the package by that same specification.

**`packages/app` is the one tree that keeps `@/`.** Its `@/` and `~/` are Nuxt's own aliases, generated into `.nuxt/tsconfig.*.json`, not a `paths` entry anyone here wrote. Nothing bundles the app from source, publishes it, or resolves into it — it is the leaf — so none of the reasons above apply to it, and converting it would mean fighting generated configuration for a property it cannot use. Anywhere else — a package, `scripts/`, `.agents/` — a `@/` specifier is a bug, and oxlint says so.

The repo-root `scripts/` tree converted too, to `#scripts/*` declared in the root manifest — so **no `paths` entry anyone here wrote survives**, and `resolve.tsconfigPaths` came out of `getVitestConfiguration` with it. The only `paths` left in the repo are the ones Nuxt generates for the app.

`tsconfig.base.json` carries **no `paths` block at all**, deliberately. The one it used to carry also held a `"*": ["${configDir}/src/*"]` fallback, which shadowed real package names — a mistyped dependency resolved to a same-named local file instead of failing. Don't add either back.

## What it buys: source exports

`getTsdownConfiguration` sets `exports: { devExports: SOURCE_CONDITION }` for every package — no package declares it — and workspace consumers then resolve **source**:

- No rebuild between an edit and a **package** consumer seeing it — the "stale dist mimics a failed fix" trap is gone from every package's tests.
- A fresh clone typechecks and tests the packages without building them first.
- Go-to-definition, breakpoints and stack traces land on real source rather than a bundled declaration.
- Typecheck sees real types, so anything a declaration bundler would flatten or widen surfaces immediately.

**Pass the condition name, never `true`.** `devExports` takes `boolean | string`, and the two do very different things:

```jsonc
// devExports: SOURCE_CONDITION — every consumer that opts in gets source, everything else gets the build.
"exports": { ".": { "source": "./src/index.ts", "default": "./dist/index.js" } }

// devExports: true — every condition points at source. Node gets TypeScript.
"exports": { ".": "./src/index.ts" }
```

Node's own ESM loader cannot read that second shape, twice over: it resolves no extensionless relative specifier, so a generated barrel's `export * from "./models/Foo"` fails outright, and its type-stripping cannot transform a TS `enum`. Nitro's prerender imports the built server through that loader, and Pulumi runs the infrastructure program's `dist` through it, so both die — and the workarounds cost more than the feature is worth. Inlining into the Nitro server has to cover **every** workspace package rather than the source-exporting ones, because a `dist` sibling externalizes its own siblings, and the Pulumi program has to vendor its siblings, which multiplies its bundle by an order of magnitude. Both are standing configuration that a new consumer has to remember. A `default` arm costs none of it, because nothing has to be configured to stay working.

**The condition is `source`**, the ecosystem's own spelling — Parcel and Metro resolve it, and it is what a workspace-source arm is called wherever one exists. Don't namespace it: a repo-prefixed name only protects against a stranger's resolver matching the arm, and no published package has one, because tsdown writes a `dist`-only map into `publishConfig.exports`.

Four places opt in, and they are the whole mechanism:

| Where                                      | How                                           | Reaches                  |
| :----------------------------------------- | :-------------------------------------------- | :----------------------- |
| `tsconfig.base.json`                       | `customConditions: [SOURCE_CONDITION]`        | every package            |
| `getVitestConfiguration`                   | `resolve.conditions`                          | every test but the app's |
| `packages/app/configuration/typescript.ts` | `customConditions` on all four Nuxt tsconfigs | the app's types          |
| `packages/app/configuration/nitro.ts`      | `customConditions` on the server tsconfig     | the app's server types   |

`resolve.conditions` **replaces** Vite's defaults rather than adding to them, which is why `getVitestConfiguration` spreads `defaultServerConditions` back in — dropping `module` and `node` silently re-resolves half the dependency tree. The tsconfig spells the condition out as a literal because JSON cannot import `SOURCE_CONDITION`; renaming the constant means editing that file too, and nothing fails loudly if you forget — every package silently falls back to `dist`.

**The app is split on purpose, and the split is the thing to know.** Its four Nuxt tsconfigs and Nitro's carry the condition, so everything that reads types — `typecheck`, the editor, go-to-definition — resolves a sibling's source. **Everything that runs does not**: neither Nuxt's Vite build nor Nitro carries it, so `build` resolves every sibling's `dist` and the server bundle keeps externalizing them instead of pulling every package's TypeScript into one graph — and neither does the app's Vitest project, which builds its own config through `defineVitestProject` rather than taking `getVitestConfiguration`, so its tests read `dist` too. That is the same trade, not an oversight: source would hand the app `vue-phaserjs`'s TypeScript, which is exactly what breaks below.

Two consequences, and both get rediscovered as bugs if this is not read first:

- **`watch:packages` still earns its keep.** For the app, an edit to a package is invisible — to its tests as much as at runtime — until that package is rebuilt, and a stale `dist` mimics a failed fix.
- **Typecheck and build can disagree.** `typecheck` reads a sibling's source while `build` reads its last-built `dist`, so an unbuilt package edit is visible to one and not the other. That is the cost of the arrangement, not a defect in it.

**Finishing the split — putting the condition on Vite and Nitro too — has been tried and is not wanted.** It is the obvious-looking fix for both consequences above and it is a bad trade: every workspace package's TypeScript joins one Rollup graph, the server bundle stops externalizing its siblings, and `vue-phaserjs` breaks outright, because its stores rely on `defineStore`/`ref` injected by its own build's `unplugin-auto-import` and the app's `configuration/imports.ts` explicitly excludes that package from Nuxt's auto-import transform (a rolldown bug). Reach for `watch:packages`, not for `resolve.conditions`.

`publint` and `attw` still gate the published shape, because both read `publishConfig.exports`, where tsdown writes the `dist`-only map.

**A build that vendors a sibling vendors its source.** Rolldown reads `customConditions` from the tsconfig it is handed, so a self-contained bundle pulls its siblings' TypeScript rather than their `dist` — which is why `isolatedDeclarations` is off in any package vendoring one that cannot satisfy it, and why a `@/` inside a vendored package was never going to work.

Two things that follow, and are easy to get wrong:

- **A `dist` sibling externalizes its own siblings.** A package's build emits its sibling's bare specifier, so whatever resolves _that_ decides which arm it gets. This is why the `default` arm has to exist rather than being handled at the consumer: every hop resolves independently.
- **Never point a condition-less export at source to "make it simpler".** The failure lands in Nitro's prerender or a `pulumi preview`, a phase away from the change that caused it, naming a module path nobody edited.
