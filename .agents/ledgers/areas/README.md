# Areas

The one partition of the tracked files, one file per area. Every file-based question in the [index](../README.md) reads its cells from this list through its `Scope`, and `pnpm ai:sweep:status <question>` says where each stands. A unit is what one pass reads, and its boundaries are written once, as one bullet in its area's file:

- `` `path` ``, or several separated by commas: a file, or a directory's whole tree.
- `` `dir` — `a`, `b` ``: those entries of the directory.
- `` `dir` — the rest ``: the directory's files no other unit names.

Each file belongs to the deepest path naming it, so a unit naming a directory never holds a file a deeper unit names. A unit that holds every file of its directory names the directory, bare or as the rest beside a deeper unit, never its entries one by one, so a file added there joins it with no edit; entries are listed only where the directory is split between units. Rewording a unit is a new unit to the trailers, so a rewording that keeps its files carries each dated pass onto the new spelling (`Ledger: <ledger> | <unit> | <date> · <model>`), and `pnpm ai:precheck --fix` moves the rows other ledgers keep for it.

| Area                      | What it holds                                                                                                                                                                                                                                  |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.                                                                                     |
| [dungeons](dungeons.md)   | The game is a fifth of the app's source. `apps/web/app/components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.                                |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and models.                                                                                                                                                                           |
| [packages](packages.md)   | Every workspace package outside `apps/web`, `packages/shared` and `packages/shared-node`. Grouped so each row is one review-sized commit.                                                                                                      |
| [products](products.md)   | The app's smaller products — everything under `apps/web/app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses. |
| [resource](resource.md)   | The resource explorer, the sheet editor and the other editors.                                                                                                                                                                                 |
| [server](server.md)       | `apps/web/server` — routers, procedure builders, guards and services.                                                                                                                                                                          |
| [shared](shared.md)       | `apps/web/shared`, `apps/web/app/components/Styled`, `packages/shared` and `packages/shared-node` — what both halves of the app read.                                                                                                          |
| [tooling](tooling.md)     | The repo's own scripts and the agent tree — code no product area claims. `scripts/`, `.agents/`, the app's root configuration and `openspec/`.                                                                                                 |
