# Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations, import blocks, drawn assets and the Azure resource declarations left out (the finder's
`constants.ts` says why for each). The workspace suite's zero test (`scripts/src/workspace/duplicateCode.test.ts`)
holds the whole scan to no finding, and its jscpd gate test holds `.jscpd.json` and CI's scan paths to the finder's
constants.

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

| Unit                                                 | Swept                  | Notes                              |
| :--------------------------------------------------- | :--------------------- | :--------------------------------- |
| `apps/functions`                                     | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/infra`                                         | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app`                                       | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/app/components`                            | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/app/components/AgentConsole`               | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/App`                        | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Dungeons`                   | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Message`                    | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/app/components/Message/Content`            | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Message/Model`              | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Resource`                   | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Styled`                     | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/Ui`                         | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/components/User`                       | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/composables`                           | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/app/composables/dungeons`                  | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/composables/message`                   | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/composables/resource`                  | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/models`                                | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/services`                              | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/app/services/dungeons`                     | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/services/message`                      | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/services/resource`                     | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/services/webpageEditor`                | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/app/store`                                 | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/server`                                    | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `apps/web/server/services`                           | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/server/trpc`                               | 2026-10-14 · Haiku 5.5 |                                    |
| `apps/web/shared`                                    | 2026-10-14 · Haiku 5.5 |                                    |
| `packages`                                           | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/agent-console-server`                      | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/azure-mock`                                | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/db`                                        | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/db-schema`                                 | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-engine`                            | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-engine/src`                        | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-engine/src/atmosphere`             | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-engine/src/character`              | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-engine/src/models`                 | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-engine/src/nodes`                  | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-engine/src/terrain`                | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-interface`                         | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-mods`                              | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-persona`                           | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-persona/src`                       | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-persona/src/localizations`         | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-persona/src/personaCards`          | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-persona/src/services`              | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world`                             | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-world/parity`                      | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src`                         | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-world/src/components`              | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-world/src/components/Hud`          | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/components/Login`        | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/components/Menu`         | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/components/World`        | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/composables`             | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/models`                  | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services`                | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-world/src/services/character`      | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services/combat`         | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services/gcg`            | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services/kit`            | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `packages/genshin-world/src/services/kit/characters` | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services/login`          | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/genshin-world/src/services/splash`         | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/nuxt-security-module`                      | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/parse-tmx`                                 | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/shared`                                    | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/trpc-nuxt-module`                          | 2026-10-14 · Haiku 5.5 |                                    |
| `packages/vue-phaserjs`                              | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src`                                        | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `scripts/src/models`                                 | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services`                               | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `scripts/src/services/fleet`                         | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets`                 | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `scripts/src/services/genshinAssets/commands`        | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/fit`             | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/kits`            | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/music`           | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/scene`           | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/shared`          | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinAssets/world`           | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinParity`                 | 2026-10-14 · Haiku 5.5 | the rest, excluding the rows above |
| `scripts/src/services/genshinParity/commands`        | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinParity/passes`          | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinParity/shared`          | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinParity/sky`             | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinParity/witness`         | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/genshinText`                   | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/outdatedDependencies`          | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/oxlint`                        | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/recreation`                    | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/review`                        | 2026-10-14 · Haiku 5.5 |                                    |
| `scripts/src/services/sweeps`                        | 2026-10-14 · Haiku 5.5 |                                    |
