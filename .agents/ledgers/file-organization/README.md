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

A duplicate constant is the one thing no skill states a grep for, because it is found by value rather than by name:

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

## Exclusions

- Generated barrels (`index.ts` from `ctix`) and `snapshot.json` — machine state.
- Literals a postinstall-evaluated or JSON config must repeat, which the skill names as the one sanctioned duplication.
- Two exports sharing module-private state through closure — a pending set, a cached promise, a code set, a
  dispatch map. One-export-per-file cannot reach them without making that state a module global, which trades a
  file boundary for a wider one.

## Open findings

- The keybinds settings page lists three shortcuts (`KEYBIND_SHORTCUTS`) that `KeyboardShortcutList` states in
  other words and other keys, and one of them (`↑` to edit the last message) appears nowhere else. Rendering the
  model on the page changes what the page shows, so it is a decision rather than a pass: either the page renders
  `KeyboardShortcutList` and the three-row list goes, or the three rows are the intended subset and the model
  gains the missing key.
- `apps/infra/src/azure/constants/` keeps one PascalCase file per constant, each a default export, and two hundred
  import sites read them that way. No rule names default exports either way — the file-organization skill only
  bans `export { }` — so converting the tree to `export const` is a convention to settle first, not a pass: the
  tree is internally consistent and the swap is sixty files of pure churn.
