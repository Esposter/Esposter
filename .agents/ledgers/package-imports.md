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
| `packages/vue-phaserjs`    |            |                                                             |
| `packages/xml2js`          |            |                                                             |

Carrying one package from the `@/*` `paths` alias to the `#src/*` subpath imports its own manifest declares, so
its internal specifiers resolve against the file that wrote them rather than against whoever is compiling. The
rule, the two ways it fails silently, and what it unlocks: the `build` skill.

A unit is one package, and it converts whole. There is no partially-converted state: a package with both
`@/models/Foo` and `#src/models/Foo.ts` in it typechecks, so nothing would ever report the leftovers.

Per package:

1. `"imports": { "#src/*": "./src/*" }` in its `package.json`, written directly after `exports`.
2. `@/` → `#src/` across `src/**`, and **add the `.ts`** — TypeScript does no extension substitution through an
   `imports` target, so an extensionless specifier resolves in the bundler and not in the compiler.
3. `exports: { devExports: true }` in its `tsdown.config.ts`, so workspace consumers resolve `src`.
4. `pnpm build` the package **and everything that vendors it** — `azure-functions` and `azure-mock` vendor
   siblings, and they are the builds that would have broken under `@/*`.

`packages/app` has no row date to earn: it is the leaf nobody resolves, and its `@/`-shaped specifiers are
Nuxt's own aliases rather than a `paths` self-alias. It is listed so the table is countable against
`packages/`.

Done when every other row is dated: delete the `paths` block from `packages/configuration/tsconfig.base.json`,
which is the only thing still resolving an unconverted package, and retire this ledger.
