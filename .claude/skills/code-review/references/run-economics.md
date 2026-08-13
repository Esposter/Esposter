# What a run covers, what it costs, and when to re-run

Read when choosing a level, reading a run's `stats`, or deciding whether another round is worth it.

## Coverage is a budget, not a measurement of the code

Each finder returns at most `stats.perAngle` candidates and the rest are truncated; the conventions finder has a small budget of its own (`stats.conventionsCap`, one candidate per correctness angle), and `xhigh`/`max` add a sweep pass with a third (`stats.sweepCap`).

**Read the ceiling off `stats.reportableCeiling`** — the script computes it from the fan-out that actually ran, and none of the three caps can be inferred from the others. Never reassemble it from a formula here; a prose formula went stale within one round and under-budgeted two levels.

So a level does not "find everything and stop". It finds the most salient handful per seam or lens, and the next-ranked defects surface only after the ones above them are fixed. A steady tens-per-round trickle on a large diff is sampling depth, not a defect count.

## Raise the level; never re-run the same one

Repeat rounds at one level re-pay the dominant cost — a verifier per file, a resolver per claim — to resample the same ranking. A level moves three axes: the higher ones widen `perAngle`, `maxSeams` and `verifyMax` and add a sweep pass, **and** every agent but the conventions family runs at that level's reasoning effort. Without the second axis a raised level is only a wider skim by agents thinking exactly as hard.

`low` is the default, and the axis it gives up is width alone: its effort is `medium`, not `low`, because a bug hunt below medium stops constructing triggers and reports what a linter would — the one saving that makes a cheap run worthless rather than cheap.

The per-level numbers are deliberately not tabulated here — the script publishes all of them per run (`stats.angles`, `perAngle`, `verifyCeiling`, `sweepCap`, `reportableCeiling`), and a prose copy of `LEVEL_PARAMS` rots the same way the prose ceiling formula did. What a reader choosing a level _before_ a run needs is the magnitude:

| Level           | Reach for it when                                                           | Agents |
| --------------- | --------------------------------------------------------------------------- | ------ |
| `low`           | the default — every ordinary review                                         | ~10–15 |
| `high`          | the defects would be expensive (server, db, auth, anything with a rollback) | ~15–30 |
| `xhigh` / `max` | a round hit a cap, and the level is the way to widen it                     | ~25–65 |

The top of each range is a seam run over a large window. That is **not** an argument for narrower windows — `modes/diff.md` owns window choice and its rule stands: batch up to one window wide enough to clear the seam threshold. The verify cap is what makes that affordable, by stopping a wide window from costing multiples of a narrow one at the same level.

`dropped N at cap` in the log is the difference between "ran dry" and "was not allowed to report more" — it is the signal to go wider. Absent it, the level's ceiling is what you got.

## Dedupe

Two candidates at the same `file:line` **of the same kind** collapse to one row, whose `corroboration` counts the distinct finders. Kind is part of the key because a bug and the stale doc sentence describing it are two deliverables. The synthesizer still merges findings sharing a root cause across different lines, cited as `alsoAt`.

**A candidate with no `line` is never deduped** — lineless is the norm for `record-gap` and `conformance`, whose subject is a file, so keying them on the filename would discard the second finding under a row falsely marked corroborated. `stats.deduped: 0` on an area run usually means the dominant kinds were never eligible.

## What bounds the cost

Cost is agents × material read, set by the level rather than the diff size. These bounds pull it back, and each logs when it bites:

- **Small territory trims the fan-out.** Under ~300 changed lines _and_ <10 files, angle count and per-angle cap drop — `stats.angles` / `stats.perAngle` report what ran.
- **No cleanup finder exists**, so the four quality lenses buy no verifier and no resolver here — why, and whose they are instead, is SKILL.md's ladder.
- **The conventions family runs at `low` effort** regardless of level, on a cap of one candidate per correctness angle: its claims are settled by quoting the rule and the line. Reasoning depth is what correctness angles buy.
- **Verify is capped by kind** at `stats.verifyCeiling`, which is the **run's** budget and not each pass's — the sweep spends from the same pot. Ordering can only use `kind`: a finder is never asked for `severity` (so it cannot inflate its own candidate past the cap; the verifier assigns it), so what the cap guarantees is that files carrying a correctness or conformance candidate are verified before files carrying only a convention nit or a record-gap. Grouping by file bounds nothing on its own — one candidate per file is the normal shape of a wide diff, and it degrades the phase holding most of a run's agents into one verifier per candidate. `stats.droppedAtVerifyCap` counts what no verifier was allowed to judge and the summary names the files, stated separately from a dead verifier because the remedy differs: **a cap that bit is answered by a narrower window or a higher level, never by re-running the same level over the same range.**
- **Generated and binary files are collapsed to a count** in every agent's file listing, both modes, every run. They stay inside the diff, but no agent is pointed at them — so "no finding against the snapshot" means nobody looked.
- **Resolution is budgeted worst-first.** A resolver reads callers, callees, dependency source and history for one claim — historically ~40% of a run's tokens. Only the worst-ranked unsettled findings get one; the rest are dropped rather than shipped unsettled (`stats.droppedUnsettled`, named in the summary). **The budget is `stats.resolveCeiling`** — read it there rather than from the `resolve: N of a M budget …` log line, which reports how many were actually sent: a run with fewer plausible findings than the cap sends fewer, and "nothing else needed resolving" and "the budget ran out" argue opposite ways about re-running.
- **Confidence gates both directions at one floor.** Under 70 is not an answer, CONFIRMED or REFUTED: a verifier's under-confident verdict routes to Resolve, a resolver's returns unsettled with its blocker. Nothing is dropped for confidence.

## A degraded run is not a clean file

Four discards carry a `stats` field, and the rest are log-only — **read the fields, never count the sites from prose**: `droppedUnfound` (a finder died, taking its lens or seam), `droppedUnverified` (a dead verifier left candidates unjudged), `droppedAtVerifyCap` (no verifier was allowed to judge them), `droppedUnsettled` (below the resolve budget). The per-finder cap, the area file cap and dropped seams/claims are visible **only** in the log (`dropped N at cap`, `seam(s) dropped`, and in `area` mode `claimsChecked` against `claimsInventoried`), so a stats block alone is not the whole picture. Any of these means the round is degraded, and the stop rule must not read one as convergence.

## The stop rule

**A round whose CONFIRMED findings are all `minor` is converged.** Fix them if cheap, then stop — minor supply is effectively unbounded on any mature file, so "the run reported something" is a loop with no exit.

Another round is justified by a CONFIRMED `critical`/`major`, a `dropped N at cap` line, a non-zero `droppedAtVerifyCap`, or a fix round that touched lines an earlier fix wrote. The first two of those are answered by raising the level; the third by narrowing the window first, since re-running the same level over the same range re-truncates at the same place.
