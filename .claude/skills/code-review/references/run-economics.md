# What a run covers, what it costs, and when to re-run

Read when choosing a level, reading a run's `stats`, or deciding whether another round is worth it.

## Coverage is a budget, not a measurement of the code

Each finder returns at most `stats.perAngle` candidates and the rest are truncated; the cleanup finder has one budget for all five of its lenses (`stats.cleanupCap`), and `xhigh`/`max` add a sweep pass with a third (`stats.sweepCap`).

**Read the ceiling off `stats.reportableCeiling`** — the script computes it from the fan-out that actually ran, and none of the three caps can be inferred from the others. Never reassemble it from a formula here; a prose formula went stale within one round and under-budgeted two levels.

So a level does not "find everything and stop". It finds the most salient handful per seam or lens, and the next-ranked defects surface only after the ones above them are fixed. A steady tens-per-round trickle on a large diff is sampling depth, not a defect count.

## Raise the level; never re-run the same one

Repeat rounds at one level re-pay the dominant cost — a verifier per file, a resolver per claim — to resample the same ranking. A level moves two axes: `xhigh`/`max` widen `perAngle` and `maxSeams` and add a sweep pass, **and** every non-cleanup agent runs at that level's reasoning effort. Without the second axis a raised level is only a wider skim by agents thinking exactly as hard.

`dropped N at cap` in the log is the difference between "ran dry" and "was not allowed to report more" — it is the signal to go wider. Absent it, the level's ceiling is what you got.

## Dedupe

Two candidates at the same `file:line` **of the same kind** collapse to one row, whose `corroboration` counts the distinct finders. Kind is part of the key because a bug and the stale doc sentence describing it are two deliverables. The synthesizer still merges findings sharing a root cause across different lines, cited as `alsoAt`.

**A candidate with no `line` is never deduped** — lineless is the norm for `record-gap` and `conformance`, whose subject is a file, so keying them on the filename would discard the second finding under a row falsely marked corroborated. `stats.deduped: 0` on an area run usually means the dominant kinds were never eligible.

## What bounds the cost

Cost is agents × material read, set by the level rather than the diff size. Four bounds pull it back, and each logs when it bites:

- **Small territory trims the fan-out.** Under ~300 changed lines _and_ <10 files, angle count and per-angle cap drop — `stats.angles` / `stats.perAngle` report what ran.
- **The cleanup family runs at `low` effort** regardless of level: its claims are settled by looking at the code they name. Reasoning depth is what correctness angles buy.
- **Generated and binary files are collapsed to a count** in every agent's file listing, both modes, every run. They stay inside the diff, but no agent is pointed at them — so "no finding against the snapshot" means nobody looked.
- **Resolution is budgeted worst-first.** A resolver reads callers, callees, dependency source and history for one claim — historically ~40% of a run's tokens. Only the worst `2 × stats.angles` unsettled findings get one; the rest are dropped rather than shipped unsettled (`stats.droppedUnsettled`, named in the summary).
- **Confidence gates both directions at one floor.** Under 70 is not an answer, CONFIRMED or REFUTED: a verifier's under-confident verdict routes to Resolve, a resolver's returns unsettled with its blocker. Nothing is dropped for confidence.

## A degraded run is not a clean file

Every discard is counted in a `stats` field and logged — **read the fields, never count the sites from prose**: `droppedUnfound` (a finder died, taking its lens or seam), `droppedUnverified` (a dead verifier left candidates unjudged), `droppedUnsettled` (below the resolve budget), plus `dropped N at cap` in the log and, in `area` mode, `claimsChecked` against `claimsInventoried`. Any of these means the round is degraded, and the stop rule must not read one as convergence.

## The stop rule

**A round whose CONFIRMED findings are all `minor` is converged.** Fix them if cheap, then stop — minor supply is effectively unbounded on any mature file, so "the run reported something" is a loop with no exit.

Another round is justified by a CONFIRMED `critical`/`major`, a `dropped N at cap` line, or a fix round that touched lines an earlier fix wrote.
