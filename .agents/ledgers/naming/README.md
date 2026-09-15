# Naming

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping. The
area names are [quality](../quality/)'s, so "was this area swept, for which question, and when" reads off
one set of names across every promoted ledger.

| Area                      | What it holds                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims. |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and models.                                                                                       |
| [resource](resource.md)   | The resource explorer, the sheet editor and the other editors.                                                                                             |
| [products](products.md)   | The app's smaller products — posts, the clicker, achievements, docs, the user pages and the standalone editors.                                            |
| [dungeons](dungeons.md)   | The game.                                                                                                                                                  |
| [server](server.md)       | `apps/web/server` — routers, procedure builders, guards and services.                                                                                      |
| [shared](shared.md)       | `apps/web/shared`, `app/components/Styled` and `packages/shared` — what both halves of the app read.                                                       |
| [packages](packages.md)   | Every workspace package outside `apps/web` and `packages/shared`.                                                                                          |
| [tooling](tooling.md)     | `scripts/`, `.agents/`, the app's root configuration and `content/`.                                                                                       |

A component file name is in scope for its **words** — the rule spelling `Navigation` over `Nav` reads a filename
the same way it reads any other identifier. The prefix-and-fold question over that same tree stays
`vue-components`'s: one tree, two questions, which is what keeps both ledgers whole. Nothing is excluded here on
the grounds that a rename is expensive — that is the argument
[no compatibility debt](/docs/architecture/no-compatibility-debt) already refuses, migrations included.
