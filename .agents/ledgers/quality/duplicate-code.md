# Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations, import blocks, drawn assets and the Azure resource declarations left out (the finder's
`constants.ts` says why for each). The workspace suite's zero test (`scripts/src/workspace/duplicateCode.test.ts`)
holds each unit swept to no finding there, and the whole scan once it finds none.

Where a finding's home looked missing, it is settled:

- **Across packages:** isomorphic code goes to `@esposter/shared`, and server-only code to `@esposter/shared-node`. Otherwise it goes to the lowest package both sides already depend on. A gap there is filled, not worked around.
- **Parallel Drizzle tables:** they share column builders, as the metadata columns already do. Where two tables name one concept differently, a `db:gen` migration renames the columns to the shared builder's names.
- **The standalone plugins** (`follow-ups`, `genshin-persona`): they import `@esposter/shared` as a devDependency, which tsdown bundles into the plugin, so a standalone install still carries it.
- **Claude mods:** a pure helper is shared through a relative import inside the plugin. Only a function calling `$`, or making an atom, stays in its register file, as the engine requires.
- **Styles:** they are shared through a shared component or stylesheet, and the visual suites stay unchanged. A style edit is never landed through a `-u`.
- **Measured data:** a clone made only of numeric literal rows is data, not code. The finder skips it.
- **Across Claude plugins:** a clone whose two sides sit in two different plugins (a package with a `.claude-plugin` folder) is not a finding, since each plugin installs standalone with no build and cannot share a file.
- **Engine-bound register code:** a clone of two `register*.ts` files under a plugin's `src/services` is not a finding, since the engine keeps each `$` call and atom in its own register file. A pure helper in any other file stays a finding.
- **Declarations and component preamble:** a clone made only of imports, interface and type bodies, `defineProps`, `defineEmits` and `defineModel` calls, or bare composable bindings is each file's own list of what it holds, not logic. The finder skips it.
- **Enum-keyed record rows:** a clone made only of the rows of a `Record` keyed by an enum is data a table holds. The finder skips it.

| Unit                                                             | Swept                  | Notes                                                                   |
| ---------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets`                             | 2026-10-11 · Haiku 5.5 |                                                                         |
| `packages/genshin-world`                                         | 2026-10-12 · Opus 5.5  | the rest of the package; `src/services/kit/characters` is its own row   |
| `packages/genshin-world/src/services/kit/characters`             | 2026-10-12 · Opus 5.5  |                                                                         |
| `packages`                                                       | 2026-10-11 · Haiku 5.5 | the light packages not named above                                      |
| `apps/web/app`                                                   | —                      | the rest of the app, excluding the rows above                           |
| `scripts/src/services/genshinParity`                             | 2026-10-14 · Haiku 5.5 |                                                                         |
| `packages/vue-phaserjs`                                          | —                      |                                                                         |
| `apps/web/shared/assets/clicker/data/upgrades`                   | 2026-10-11 · Haiku 5.5 |                                                                         |
| `apps/web/app/components/Message`                                | 2026-10-14 · Haiku 5.5 |                                                                         |
| `apps/infra`                                                     | 2026-10-11 · Haiku 5.5 | the rest of the infrastructure, excluding the Azure resource rows above |
| `packages/genshin-engine`                                        | 2026-10-11 · Haiku 5.5 |                                                                         |
| `packages/db-schema`                                             | —                      |                                                                         |
| `apps/web/server/trpc/routers`                                   | 2026-10-14 · Haiku 5.5 |                                                                         |
| `packages/agent-console-server`                                  | 2026-10-11 · Haiku 5.5 |                                                                         |
| `apps/web/app/services/dungeons`                                 | 2026-10-11 · Haiku 5.5 |                                                                         |
| `apps/web/app/models/resource`, `apps/web/app/services/resource` | —                      |                                                                         |
| `packages/shared`                                                | 2026-10-11 · Haiku 5.5 |                                                                         |
| `scripts/src`                                                    | 2026-10-14 · Haiku 5.5 | the rest of the tooling, excluding the rows above                       |
| `apps/web/shared`                                                | —                      | the rest of the shared tree, excluding the clicker upgrades row above   |
| `apps/web/server`                                                | —                      | the rest of the server, excluding the router row above                  |
| `apps/functions/src`                                             | 2026-10-11 · Haiku 5.5 | no finding today; the row stays so a copy that lands there is read      |
