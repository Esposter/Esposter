# Security

## Areas

Coverage lives in the area file, never here. A pass loads this file, the `security` skill's checklist
(`.agents/skills/security/references/owasp-top-10.md`), the register of verified boundaries
(`openspec/specs/architecture/security/README.md`) and the one area it is sweeping. A flow the register
already answers is cited from its row rather than read again. The area names and units are
[quality](../quality/)'s, so "was this area swept, for which question, and when" reads off one set of names across
every promoted ledger.

| Area                      | What it holds                                                                                                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service and composable layers no single feature claims.                                                                            |
| [messaging](messaging.md) | Esbabbler — its components, store, composables, services and models.                                                                                                                                                                  |
| [resource](resource.md)   | The resource explorer, the sheet editor and the other editors.                                                                                                                                                                        |
| [products](products.md)   | The app's smaller products — everything under `app/components` that is neither messaging nor the resource explorer. Each row carries a product's components together with the store, composable, service and page files only it uses. |
| [dungeons](dungeons.md)   | The game is a fifth of the app's source. `components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.                                    |
| [server](server.md)       | `apps/web/server` — routers, procedure builders, guards and services.                                                                                                                                                                 |
| [shared](shared.md)       | `apps/web/shared`, `app/components/Styled`, `packages/shared` and `packages/shared-node` — what both halves of the app read.                                                                                                          |
| [packages](packages.md)   | Every workspace package outside `apps/web`, `packages/shared` and `packages/shared-node`. Grouped so each row is one review-sized commit.                                                                                             |
| [tooling](tooling.md)     | The repo's own scripts and the agent tree — code no product area claims. `scripts/`, `.agents/`, the app's root configuration and `openspec/`.                                                                                        |

Unlike most sweeps, a finding here usually changes behaviour: it closes a hole. Each one is fixed in its own commit
with its regression test, apart from the unit's `Ledger:` trailer commit, so reverting a fix never reopens the
coverage. An accepted risk its owning page already records is not a finding.

## Find recipe

The checklist is read, not grepped, but these sinks are where a unit's reading starts. Each hit is checked against
the checklist row it belongs to, and a hit that proves safe is not a finding. The recipe was run against the tree
when the ledger was opened and returns hits, so an empty result for a unit means the unit has none of these sinks.

```sh
git grep -n -E "v-html|innerHTML|sql\.raw\(|Math\.random\(|execSync\(|execFileSync\(|spawn\(|new Function\(|eval\(|process\.argv" -- <unit> ':!*.test.ts'
```

Procedures and routes are read in full whatever the grep finds, since a missing guard leaves no string to match.
