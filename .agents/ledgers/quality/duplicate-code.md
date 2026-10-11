# Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations and import blocks left out. The sweep ends at zero findings, after which
`scripts/src/workspace/duplicateCode.test.ts` holds it there.

| Unit                                                                     | Swept | Notes                                                                                                                      |
| ------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/app/assets/dashboard/demo/icon`                                | —     | ApexCharts preview SVGs; a copy is markup, so the fix is one shared renderer or a removed export, not an edit to each icon |
| `scripts/src/services/genshinAssets`                                     | —     |                                                                                                                            |
| `packages/genshin-world`                                                 | —     | the rest of the package; `src/services/kit/characters` is its own row                                                      |
| `packages/genshin-world/src/services/kit/characters`                     | —     |                                                                                                                            |
| `apps/infra/src/azure/resources/Microsoft.Web`                           | —     | dev and prod copies of one resource; the fix is a factory over the stage, or the pair stays                                |
| `packages`                                                               | —     | the light packages not named above                                                                                         |
| `apps/infra/src/azure/resources/Microsoft.Authorization/roleAssignments` | —     |                                                                                                                            |
| `apps/infra/src/azure/resources/Microsoft.EventGrid`                     | —     |                                                                                                                            |
| `apps/web/app`                                                           | —     | the rest of the app, excluding the rows above                                                                              |
| `scripts/src/services/genshinParity`                                     | —     |                                                                                                                            |
| `packages/vue-phaserjs`                                                  | —     |                                                                                                                            |
| `apps/web/shared/assets/clicker/data/upgrades`                           | —     |                                                                                                                            |
| `apps/web/app/components/Message`                                        | —     |                                                                                                                            |
| `apps/infra`                                                             | —     | the rest of the infrastructure, excluding the Azure resource rows above                                                    |
| `packages/genshin-engine`                                                | —     |                                                                                                                            |
| `packages/db-schema`                                                     | —     |                                                                                                                            |
| `apps/infra/src/azure/resources/Microsoft.Storage`                       | —     |                                                                                                                            |
| `apps/web/server/trpc/routers`                                           | —     |                                                                                                                            |
| `packages/agent-console-server`                                          | —     |                                                                                                                            |
| `apps/web/app/services/dungeons`                                         | —     |                                                                                                                            |
| `apps/web/app/models/resource`, `apps/web/app/services/resource`         | —     |                                                                                                                            |
| `apps/web/app/assets`                                                    | —     | the rest of the assets, excluding the icon row above                                                                       |
| `packages/shared`                                                        | —     |                                                                                                                            |
| `scripts/src`                                                            | —     | the rest of the tooling, excluding the rows above                                                                          |
| `apps/web/shared`                                                        | —     | the rest of the shared tree, excluding the clicker upgrades row above                                                      |
| `apps/web/server`                                                        | —     | the rest of the server, excluding the router row above                                                                     |
| `apps/functions/src`                                                     | —     | no finding today; the row stays so a copy that lands there is read                                                         |
