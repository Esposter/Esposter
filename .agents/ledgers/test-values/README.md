# Test Values

Every value a suite writes, read against the `test-values` skill across the suites written before it was: the
canonical scalars, the three checks a string literal passes, and what production owns imported rather than
restated. The date half that a linter can decide is not here — `test-values/no-typed-date` fails on the line
that types one — so a pass reads for what no rule can: a semantic name the code never reads, a fixture that
mirrors a production constant, a value further from the least than the case needs.

## Rules

| Rule                                                             | Owner                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| The least value that still distinguishes; one canonical per kind | `test-values` — "Canonical values"                         |
| Every string literal passes one of three checks                  | `test-values` — "Every string literal …"                   |
| Shared data declared once; what production owns imported         | `test-values` — "Shared data"                              |
| A date read by its shape moves by the smallest step, in 1970     | `test-values` — "Dates and times"                          |
| No typed date                                                    | enforced: `test-values/no-typed-date` (the `oxlint` skill) |

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state.

## Areas

Coverage lives in the area file, never here. A pass loads this file and the one area it is sweeping. The area
names and units are [testing](../testing/)'s, so "was this area swept, for which question, and when" reads off
one set of names across both ledgers.

| Area                      | What it holds                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-shell](app-shell.md) | Everything a product mounts inside rather than owns: the chrome, the routes, and the cross-cutting service, composable and store layers no single feature claims.         |
| [messaging](messaging.md) | Esbabbler — the room, its message list, and everything only they read. The server half belongs to [server](server.md).                                                    |
| [resource](resource.md)   | The resource explorer, the sheet editor, and the other content editors.                                                                                                   |
| [products](products.md)   | The app's smaller products — posts, the clicker, achievements. Each row carries a product's components with the store, composable and service files only it uses.         |
| [dungeons](dungeons.md)   | The game, and the Phaser layer only it uses.                                                                                                                              |
| [server](server.md)       | `apps/web/server` — every router, procedure builder, guard and service.                                                                                                   |
| [shared](shared.md)       | `apps/web/shared` and the `Styled` primitives — what both halves of the app read.                                                                                         |
| [packages](packages.md)   | Every workspace package outside `apps/web`.                                                                                                                               |
| [tooling](tooling.md)     | The repo's own scripts and the app's config suites — what tests the toolchain rather than a product: `scripts/`, `.agents/`, the app's root config suites and `content/`. |

## Find recipe

```bash
git ls-files "*.test.ts" "*.test-d.ts" "*.bench.ts"
```

Enumeration is the whole recipe: none of the rules above is decidable by a grep (the skill's Settled list and
the proposal that shipped the date rule say why — every other exception is a roster), so a pass reads every file
its unit names, and there is no "the scan came back clean".

## Exclusions

- Suite structure over the same files — constant scope, mock cleanup, assertion style, what earns a test —
  belongs to the [testing](../testing/) ledger; this one reads only the values.
- `genshin-persona` keeps its own `TEST_EPOCH_DATE`: a workspace import cannot reach a plugin installed by a
  frozen `npm ci` (the `test-values` skill's Settled list). A pass reads it against the skill like any other
  package and never rewrites the constant to an import.
