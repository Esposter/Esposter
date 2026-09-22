# File organization

The question is where a thing lives and whether it exists twice — one export per file, no magic string where a constant already means it, no duplicate constant, the sole-consumer subfolder rule, alias imports, and an interface or type in its own model file rather than beside the code that reads it.

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

## Find recipe

```bash
pnpm ai:sweep:file-organization
```

The scan lives in `scripts/src/sweeps/fileOrganization/` rather than in this file because it is a program: whether
a second export is a second concern is a comparison of names word by word — a schema beside its type, an enum
beside its values array, a table beside its row type and select schema — and a grep cannot hold that. What it
prints is a candidate list for the pass, never a finding: the skill's exceptions are a roster no scan can hold,
so no workspace test asserts the list empty, and a unit is dated by reading it, not by the scan coming back
clean. Its cases are `getFileOrganizationFindings.test.ts`, which is what keeps "prove the scan can fail" proved.

A duplicate constant is the one thing the scan does not read, because it is found by value rather than by name:

```bash
# String literals appearing in more than one file — the candidate list, not the finding
grep -rhoE '"[a-zA-Z][a-zA-Z0-9 ./_-]{4,}"' --include=*.ts --include=*.vue apps/web/app apps/web/server apps/web/shared packages/*/src |
  sort | uniq -c | sort -rn | awk '$1 > 1'
```

## The consumer scan

The ≥2-consumers rule is answered by counting the **packages** that name each export, which needs the whole repo
in memory rather than a grep per name:

```bash
pnpm ai:sweep:shared-export-consumers
```

It excludes the export's own **package**, not merely its own file: `packages/shared` naming its own export is the
library using itself, and counting that would let one real consumer clear a threshold that asks for two. An
export the package's other files read is a piece of one that does clear it and is not reported. What is reported
says what the pass does: `move to <package>` for an export one package alone names — it goes beside that consumer,
its colocated test with it, and the alias import replaces the barrel one — and `dead` for an export nothing names.
A clean pass prints nothing, and `scripts/src/workspace/sharedExportConsumers.test.ts` fails on anything it
prints, so the rule is enforced rather than swept.

## Next enforceable

A screaming constant at module scope in an SFC or a composable. Two sittings have now written it — the two the
last one moved beside their consumers, the eleven this one did — and it is decidable from one file's syntax with
no list: a `const` whose name is `SCREAMING_SNAKE` at the top level of a `.vue` script or a `composables/**`
file, `constants.ts` excepted. The next pass that writes it writes the oxlint plugin instead (`oxlint` skill,
`references/custom-js-plugins.md`), and the scan's `module constant` check retires with it.

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- Two exports sharing module-private state through closure — a pending set, a cached promise, a code set, a
  dispatch map, the four names `initTRPC` hands out. One-export-per-file cannot reach them without making that
  state a module global, which trades a file boundary for a wider one.
- A table read as two entities keeps both select schemas in the table file (`posts` as comments): the second
  schema is derived from the same table, so it is the table's concern rather than a second one.
