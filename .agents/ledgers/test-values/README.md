# Test Values

Every value a suite writes, read against the `test-values` skill across the suites written before it was: the
canonical scalars, the three checks a string literal passes, and what production owns imported rather than
restated. The date half that a linter can decide is not here — `test-values/no-typed-date` fails on the line
that types one — so a pass reads for what no rule can: a semantic name the code never reads, a fixture that
mirrors a production constant, a value further from the least than the case needs.

## Rules

| Rule                                                             | Owner                                    |
| ---------------------------------------------------------------- | ---------------------------------------- |
| The least value that still distinguishes; one canonical per kind | `test-values` — "Canonical values"       |
| Every string literal passes one of three checks                  | `test-values` — "Every string literal …" |
| Shared data declared once; what production owns imported         | `test-values` — "Shared data"            |
| A date read by its shape moves by the smallest step, in 1970     | `test-values` — "Dates and times"        |

Enforced rather than swept, so not in this table:

- no typed date: `test-values/no-typed-date`, in `oxlint.config.ts`
- the fake clock's moments are `Temporal.Instant`s: `scripts/src/services/oxlint/selectorBan/syntaxes/restrictedTestSyntaxes.ts`

Every row resets when a rule joins this table: a unit dated against a narrower rule set is not swept against the
current one, and there is no partially-swept state.

## Areas

The areas and their units are the shared [area list](../areas/), and `pnpm ai:sweep:status test-values` says where each unit stands. It keeps an area file only for the units it holds a note on: [app-shell](app-shell.md), [dungeons](dungeons.md), [messaging](messaging.md), [packages](packages.md), [resource](resource.md), [server](server.md) and [shared](shared.md). A pass loads this file, the unit's bullet in the list and this ledger's file for the area where it has one.

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
