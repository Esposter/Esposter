# Bench

What a `*.bench.ts` measures and how, carried across the benches written before each rule was written down: the
registration shape, the fixture freshness a mutating op needs, the grouping that keeps `vs base` meaningful, and
the two ways a bench quietly stops measuring what it names.

## Rules

| Rule                                                                     | Owner                                     |
| ------------------------------------------------------------------------ | ----------------------------------------- |
| One `test()` per group, one `bench.compare()` inside it                  | `bench` — "Writing benchmarks"            |
| `BENCHMARK_RUN_OPTIONS` last; a heavier group spreads its own counts     | `bench` — "Writing benchmarks"            |
| Mutating ops rebuild the fixture inside the callback, at every level     | `bench` — "Writing benchmarks"            |
| Read-only inputs hoisted to module scope, not rebuilt in the callback    | `bench` — "Writing benchmarks"            |
| One test per scale; shape varied inside a group                          | `bench` — "Writing benchmarks"            |
| The unit, never its `use*` composable wrapper                            | `bench` — "Writing benchmarks"            |
| A switched-off bench ANDs `IS_ENABLED` into the gate it already has      | `bench` — "Running"                       |
| The export-getter warning is answered in config, never in the code       | `bench` — "Writing benchmarks"            |
| Committed `*.bench.json` + `*.bench.md` beside the file, both up to date | `bench` — `references/report-pipeline.md` |

## Units

| Unit                                                      | Swept      | Notes                                                                             |
| --------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `apps/web` — the sheet command benches and their fixtures | 2026-09-09 | 6 groups plus the 4 `.bench.ts` fixture files that carry `describe.todo`          |
| `packages/virrun`                                         | 2026-09-09 | two of the three are switched off — read the gate before judging the bench        |
| `scripts`                                                 | 2026-09-09 | `buildPackages` is switched off and deletes each `dist`, so it also skips on `CI` |

## Find recipe

```bash
git ls-files "*.bench.ts"
```

Enumeration is the whole recipe, and deliberately: **none of these rules is decidable by a grep or a lint rule**,
which is why they are a ledger rather than a plugin. Whether a fixture is fresh all the way down, whether a group
holds one scale, whether the thing benched is the unit or its wrapper — each is a question about what the code
means, and the population is small enough (a dozen files) that reading all of them costs less than a scan that
would have to be believed. So a pass reads every file its unit names; there is no "the scan came back clean".

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
  is next flipped on for a reason of its own. `localMonorepo.platform`'s `test - packages/shared` is there:
  `vitest(valid-title)` forbids a `test()` title starting with `test`, so the Vitest 5 migration could not keep
  the name its `describe` used to give the group, and no rename passes lint _and_ matches the committed heading.

## Exclusions

- Test-file conventions over the same files — constant scope, mock cleanup, assertion style — belong to the
  [testing](testing/) ledger, whose scope already names `*.bench.ts`. This one reads only what makes a
  measurement honest.
- The numbers themselves are never a finding. A bench is a diff over time on one host, and absolute means drift
  between sittings by more than most regressions are worth; a pass that reads a table and calls it slow is
  reading noise.

## Next enforceable

- "Committed artifact exists and names the groups the file registers" is the one rule here a program could hold,
  and it wants a test rather than a lint rule: the pair of files is discoverable from `git ls-files`, and the
  group titles are the reporter's own projection of the test names. It is worth writing the day a third bench
  file lands without its artifact; twice is coincidence.
