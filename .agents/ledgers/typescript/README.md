# TypeScript

Most of the `typescript` skill is lint- or typecheck-decided; what this sweep carries is the part that needs a reader — whether two branches are mutually exclusive, whether a cast stands in for a type that could be modelled, whether a signature says what it accepts.

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

## The find recipe

The chain candidates — a guard whose next statement at the same indent is another guard. Roughly one in four is a chain; the rest are guards over different subjects, or guards each depending on the one above having passed, which the rule keeps split. A guard followed by the fall-through `return` is not a candidate any more: `no-restricted-syntax` in `packages/configuration/eslint/restrictedSourceSyntaxes.js` refuses it, so the pass reads only the consecutive-guard shape.

```bash
rg -U --pcre2 '^(\s*)if \(.*\) return .*;\n(\1//.*\n)*\1if \(.*\) return .*;' -g '*.ts' -g '*.vue' apps packages scripts
```

The comment group is load-bearing: a line of prose between two guards hides a
chain from the pattern without it, and a guard is exactly where this codebase writes prose.

## Exclusions

- **`apps/web/content/docs`** — prose, and the `docs` ledger's.
- **`apps/web/shared/generated`** — generated output, rewritten by its generator rather than by hand.
- **`*.test.ts`, `*.bench.ts`** — the `testing` ledger reads them against its own skill, which states where a suite may diverge from these rules.
