# Duplicate code

Every run of code two files share, found by `pnpm ai:sweep:duplicate-code` over the code scopes, with tests, generated
output, declarations, import blocks, drawn assets and the Azure resource declarations left out (the finder's
`constants.ts` says why for each). The sweep ends at zero findings, after which
a zero test in the workspace suite holds it there.

Where a finding's home looked missing, it is settled:

- **Across packages:** isomorphic code goes to `@esposter/shared`, and server-only code to `@esposter/shared-node`. Otherwise it goes to the lowest package both sides already depend on. A gap there is filled, not worked around.
- **Parallel Drizzle tables:** they share column builders, as the metadata columns already do. Where two tables name one concept differently, a `db:gen` migration renames the columns to the shared builder's names.
- **The standalone plugins** (`follow-ups`, `genshin-persona`): they import `@esposter/shared` as a devDependency, which tsdown bundles into the plugin, so a standalone install still carries it.
- **Claude mods:** a pure helper is shared through a relative import inside the plugin. Only a function calling `$`, or making an atom, stays in its register file, as the engine requires.
- **Styles:** they are shared through a shared component or stylesheet, and the visual suites stay unchanged. A style edit is never landed through a `-u`.
- **Measured data:** a clone made only of numeric literal rows is data, not code. The finder skips it.

| Unit                                                             | Swept | Notes                                                                 |
| ---------------------------------------------------------------- | ----- | --------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets`                             | —     |                                                                       |
| `packages/genshin-world`                                         | —     | the rest of the package; `src/services/kit/characters` is its own row |
| `packages/genshin-world/src/services/kit/characters`             | —     |                                                                       |
| `packages`                                                       | —     | the light packages not named above                                    |
| `apps/web/app`                                                   | —     | the rest of the app, excluding the rows above                         |
| `scripts/src/services/genshinParity`                             | —     |                                                                       |
| `packages/vue-phaserjs`                                          | —     |                                                                       |
| `apps/web/shared/assets/clicker/data/upgrades`                   | —     |                                                                       |
| `apps/web/app/components/Message`                                | —     |                                                                       |
| `apps/infra`                                                     | —     | its Azure resource declarations are left out of the scan              |
| `packages/genshin-engine`                                        | —     |                                                                       |
| `packages/db-schema`                                             | —     |                                                                       |
| `apps/web/server/trpc/routers`                                   | —     |                                                                       |
| `packages/agent-console-server`                                  | —     |                                                                       |
| `apps/web/app/services/dungeons`                                 | —     |                                                                       |
| `apps/web/app/models/resource`, `apps/web/app/services/resource` | —     |                                                                       |
| `packages/shared`                                                | —     |                                                                       |
| `scripts/src`                                                    | —     | the rest of the tooling, excluding the rows above                     |
| `apps/web/shared`                                                | —     | the rest of the shared tree, excluding the clicker upgrades row above |
| `apps/web/server`                                                | —     | the rest of the server, excluding the router row above                |
| `apps/functions/src`                                             | —     | no finding today; the row stays so a copy that lands there is read    |
