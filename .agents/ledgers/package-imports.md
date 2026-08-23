# Package imports

| Unit                       | Swept      | Notes                                                       |
| -------------------------- | ---------- | ----------------------------------------------------------- |
| `packages/app`             |            | not a package anyone resolves — see below                   |
| `packages/azure`           | 2026-08-23 | the pilot; `devExports` on, vendored from source by a build |
| `packages/azure-functions` |            |                                                             |
| `packages/azure-mock`      |            |                                                             |
| `packages/configuration`   |            | the bootstrap package — convert last                        |
| `packages/db`              |            |                                                             |
| `packages/db-mock`         |            |                                                             |
| `packages/db-schema`       |            |                                                             |
| `packages/infra`           |            |                                                             |
| `packages/parse-tmx`       |            |                                                             |
| `packages/shared`          |            |                                                             |
| `packages/shared-node`     |            |                                                             |
| `packages/virrun`          |            |                                                             |
| `packages/vue-phaserjs`    |            | a second `.vue` key; 204 files                              |
| `packages/xml2js`          |            |                                                             |

Carrying one package from the `@/*` `paths` alias to the `#src/*` subpath imports its own manifest declares, so
its internal specifiers resolve against the file that wrote them rather than against whoever is compiling. The
rule, the three details that carry it, and what it unlocks: the `build` skill.

A unit is one package. A package half-converted is fully working — both aliases resolve at once, so a file on
`@/models/Foo` and a file on `#src/models/Foo` sit side by side and everything builds — which is exactly why
the row is the only thing that knows. Split a large package across pushes freely; date its row when the last
`@/` in it is gone, never before.

Per package:

1. `"imports": { "#src/*": "./src/*.ts" }` in its `package.json`, written directly after `exports`. The `.ts`
   belongs to the target: TypeScript does no extension substitution through an `imports` target, and a bare
   `"./src/*"` resolves in the bundler but not in the compiler.
2. `@/` → `#src/` across `src/**`. Specifiers stay extensionless, except for a file type the package needs a
   second key for — `vue-phaserjs` adds `"#src/*.vue": "./src/*.vue"` and its five `.vue` self-imports keep
   their own extension. A specifier naming a **directory** has to name the file instead: `@/store` resolved to
   `src/store/index.ts` by directory lookup, and `#src/store` asks for `./src/store.ts`, so it becomes
   `#src/store/index`.
3. `exports: { devExports: SOURCE_CONDITION }` in its `tsdown.config.ts`, so a consumer that opts into that
   condition resolves `src` and everything else falls through to `dist`. Never `true` — that drops the
   `default` arm and hands Node's own loader TypeScript, which it cannot read.
4. `pnpm build` the package **and everything that vendors it** — `azure-functions` and `azure-mock` vendor
   siblings, and they are the builds that would have broken under `@/*`.
5. `pnpm --filter @esposter/app run build`. This is the step that catches what a package build cannot: Nitro's
   prerender imports the built server through Node's own ESM loader, and a `pulumi preview` runs `infra`'s
   `dist` through the same one. Neither opts into the source condition, so both should resolve `dist` and
   neither should notice the conversion — this build is what proves it.

`packages/app` has no row date to earn: it is the leaf nobody resolves, and its `@/`-shaped specifiers are
Nuxt's own aliases rather than a `paths` self-alias. It is listed so the table is countable against
`packages/`.

Done when every other row is dated: delete the `paths` block from `packages/configuration/tsconfig.base.json`,
which is the only thing still resolving an unconverted package, and retire this ledger.
