# Bench

What a `*.bench.ts` measures and how, carried across the benches written before each rule was written down: the
registration shape, the fixture freshness a mutating op needs, the grouping that keeps `vs base` meaningful, and
the two ways a bench quietly stops measuring what it names.

## Rules

| Rule                                                                     | Owner                                     |
| ------------------------------------------------------------------------ | ----------------------------------------- |
| One `test()` per group, one `bench.compare()` inside it                  | `bench` — "Writing benchmarks"            |
| `BENCHMARK_RUN_OPTIONS` last; a heavier group spreads its own counts     | `bench` — "Writing benchmarks"            |
| Mutating ops rebuild the fixture in the task's `beforeEach`, every level | `bench` — "Writing benchmarks"            |
| Read-only inputs hoisted to module scope, not rebuilt in the callback    | `bench` — "Writing benchmarks"            |
| One test per scale; shape varied inside a group                          | `bench` — "Writing benchmarks"            |
| The unit, never its `use*` composable wrapper                            | `bench` — "Writing benchmarks"            |
| A switched-off bench ANDs `IS_ENABLED` into the gate it already has      | `bench` — "Running"                       |
| The export-getter warning is answered in config, never in the code       | `bench` — "Writing benchmarks"            |
| Committed `*.bench.json` + `*.bench.md` beside the file, both up to date | `bench` — `references/report-pipeline.md` |

## Units

| Unit                                                                                                                                                                               | Notes                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/keyframe-store`                                                                                                                                                          | one `test.for` per document size; every write task copies the seeded backend |
| `apps/web/app` — `storeRefDestructure.test.ts`, `templates.bench.json`, `templates.bench.md`, `templates.bench.ts`, `templates.test.ts`, `test`, `walkElements.test.ts`, `workers` | the template checks' parse, walk and generate costs                          |

Notes on a tree several units share:

- `scripts`: `buildPackages` is switched off and deletes each `dist`, so it also skips on `CI`

## Find recipe

```bash
git ls-files "*.bench.ts"
```

Enumeration is the whole recipe, and deliberately: none of these rules is decidable by a grep or a lint rule (the
`bench` skill's Settled list says why), and the population is small enough that reading every file costs less than
a scan that would have to be believed. So a pass reads every file its unit names; there is no "the scan came back
clean". The grep below only orders what a pass reads first, and what it misses is still read:

```bash
# a construction inside a timed callback, which a value the timed call mutates or consumes belongs before the timing
git grep -n -A 4 -E '(^|[^A-Za-z_.])bench\(' -- '*.bench.ts' | grep -E '(create|make|build)[A-Za-z]*\(|new [A-Z][A-Za-z]*\('
```

Its hits are judged in the callback. A hit inside a task's `beforeEach` is not timed and is not a finding. A value the
timed call mutates or consumes is a finding; a construction that is the thing measured (a `built` group, a `native`
baseline building the same markup as the unit) is not, and neither is a fresh output accumulator the call's contract
takes.

```bash
# a bench importing from a test module, whose helper may build the state the timed call steps on every call
git grep -n -E 'from "[^"]*\.test"' -- '*.bench.ts'
```

Its hits are judged by what the helper does inside the timed callback. A helper that builds the state the timed call
mutates is a finding, and no grep sees inside it; a constant, or a helper only the module scope or a `beforeEach`
calls, is not.

```bash
# a comment stating a file's line count, which drifts with the file and so says nothing the file does not
git grep -n -E '//.*[0-9][0-9.,]*k?[ -]?lines?' -- '*.bench.ts'
```

A hit is a finding whatever its figure. The fix states the scale in words, or drops the figure, since the file is the
measure.

## Judging a match

- **A fixture helper that spreads a container is not isolation.** Copy every level the benched code writes
  through. The failure is silent and reads as a speedup: a command that renames a shared column on iteration one
  returns early on all nine that follow, so the mean is one real run and nine no-ops.
- **A group mixing scales is a finding when the group also varies shape**, because `vs base` then reports the
  ratio between two fixture sizes rather than between two shapes. A unit whose only axis _is_ input size has no
  shape to hold fixed, so its sizes belong in one group — splitting them leaves single-task groups reading
  `1.00×`, which measures nothing.
- **A bench with no committed `.bench.md` beside it has never been run**, and one whose `.bench.md` names a
  group the file no longer registers has been renamed without a re-run. Both are findings; the fix is `pnpm bench`
  in that package and committing what it writes — except where the artifact is right and the registration drifted
  off it, which is a rename to undo rather than a run to redo. A bench measuring the host rather than the repo
  commits one artifact per platform (`*.bench.win32.md`, `*.bench.linux.md`) and has no unsuffixed pair, so read
  the suffixes before calling one missing.
- **A switched-off bench is not a finding.** Three are off on purpose and say why in a comment. What _is_ a
  finding is a file that replaced its capability gate with `IS_ENABLED` instead of ANDing the two, or one whose
  test skips while its module-scope setup still performs the install.
- **A switched-off bench cannot be re-run to settle a drifted artifact, and must not be.** Its groups skip, so
  the reporter writes a file with their sections gone — the fix for a live bench deletes the numbers of a
  switched-off one. Where the two disagree, the artifact is the record and the drift is carried until the bench
  is next flipped on for a reason of its own. The `test - packages/shared` group is there:
  `vitest(valid-title)` forbids a `test()` title starting with `test`, so the Vitest 5 migration could not keep
  the name its `describe` used to give the group, and no rename passes lint _and_ matches the committed heading.

## Exclusions

- Test-file conventions over the same files — constant scope, mock cleanup, assertion style — belong to the
  [testing](testing/) ledger, whose scope already names `*.bench.ts`. This one reads only what makes a
  measurement honest.
- The numbers themselves are never a finding. A bench is a diff over time on one host, and absolute means drift
  between sittings by more than most regressions are worth; a pass that reads a table and calls it slow is
  reading noise.
