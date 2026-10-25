# Self-alias with `#src/`, not `@/`

Read when a package imports its own source through `#src/*`, a `#src` specifier fails to resolve, or a `@/` specifier is about to be written outside `apps/web`.

A package refers to its own source through **Node subpath imports**, declared in its own manifest:

```json
{ "imports": { "#src/*": "./src/*.ts" } }
```

```ts
import { escapeValue } from "#src/services/transformer/escapeValue";
```

**These details are load-bearing:**

- **The extension goes in the target, not the specifier.** Nothing here does extension substitution through an `imports` target: given `"./src/*"`, TypeScript computes `./src/services/transformer/escapeValue`, finds no such file, and reports the module missing. Carrying `.ts` on every specifier also fixes it, and is the wrong fix — the pattern substitutes into `./src/*.ts`, so one line in the manifest does what hundreds of edits would, and specifiers stay extensionless like everything else in the repo.
- **One key per extension the package self-imports.** `./src/*.ts` is the default arm, not a claim that a package only ever holds `.ts`. A package that self-imports something else adds a key whose suffix says so, and the longer suffix wins the match:

  ```json
  { "imports": { "#src/*": "./src/*.ts", "#src/*.vue": "./src/*.vue" } }
  ```

  Those specifiers keep their own extension — `#src/components/Container.vue` — which is what a `.vue` or `.json` import carries anyway. Don't reach for an **array** target (`["./src/*.ts", "./src/*.vue"]`) to avoid the second key: TypeScript walks the fallbacks, Vite does not, so it typechecks and then fails to resolve under Vitest.

- **The key cannot be `#/`.** Node reserves that shape, and `#src/*` is the closest legal spelling to the `@/*` it replaces.
- **A directory is not a specifier.** `paths` resolved `@/store` by directory lookup to `src/store/index.ts`; `#src/store` substitutes to the literal `./src/store.ts` and nothing else, so a directory has to be named as `#src/store/index`. Where both exist — a `src/<name>.ts` file **and** a `src/<name>/` directory — the file is the bare `#src/<name>` and only the barrel takes the `/index`. Getting that one backwards leaves the specifier unresolved, and rolldown reports it as an _external_ import the `onlyImport` gate rejects, naming a package that has nothing to do with it.

`@/*` was a `paths` entry, which is resolved by whichever tsconfig drives the _current compilation_ — so the moment a sibling bundles the package from source, `@/models/Clause` re-points into the bundling package and resolves to nothing. A `#` specifier is resolved by walking up to the nearest `package.json`, which is the one owning the importing **file**, so it survives. That is not a tooling gap to wait out: `paths` is a compiler fiction with no runtime meaning, and no configuration makes it survive. `imports` is in the Node ESM specification, implemented by Node, TypeScript, Rolldown, Vite, esbuild, webpack, Vitest and jiti alike, and it is private to the package by that same specification.

**`apps/web` is the one tree that keeps `@/`.** Its `@/` and `~/` are Nuxt's own aliases, generated into `.nuxt/tsconfig.*.json`, not a `paths` entry anyone here wrote. Nothing bundles the app from source, publishes it, or resolves into it — it is the leaf — so none of the reasons above apply to it, and converting it would mean fighting generated configuration for a property it cannot use. Anywhere else — a package, `scripts/`, `.agents/` — a `@/` specifier is a bug, and oxlint says so.

The repo-root `scripts/` tree is a member of its own and declares `#src/*` like any package — so **no `paths` entry anyone here wrote exists**, and `getVitestConfiguration` sets no `resolve.tsconfigPaths`. The only `paths` in the repo are the ones Nuxt generates for the app.

`tsconfig.base.json` carries **no `paths` block at all**, deliberately: a `"*": ["${configDir}/src/*"]` fallback shadows real package names, so a mistyped dependency resolves to a same-named local file instead of failing. Don't add one.
