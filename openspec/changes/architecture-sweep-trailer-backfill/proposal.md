# Sweep trailer backfill

## Why

A sweep dates its ledger row from a `Ledger: <ledger> | <unit>` trailer on the commit that swept the unit. The Genshin spec-evidence sweep, run from d05ce9e3d8 to 296087284c, landed about twenty units as `docs(genshin): ... keeps only the citations and open entries the sources on disk support` commits with no trailer. `pnpm ai:sweep:ledger-coverage` therefore dates none of them, and `.agents/ledgers/genshin-spec-evidence.md` still reads `—` on every row, so the ledger reports no progress for work that was done.

## What changes

- The owner decides how units swept without a trailer are dated, the one choice that changes history or the tool.
- The chosen path is then built, and the ledger rows for those units are dated by it.

## Open question for the owner

There are three ways to date the swept units. The change as written does not pick one.

1. **Backfill with a ledger-only commit (recommended).** One commit after the sweep carries a `Ledger:` trailer for each unit whose sweep commit changed the unit's file, so the script dates the rows. The rows then carry the backfill's date, not the sweep's, which is the one place the date is wrong. The commit body names each sweep commit it stands for, so the record is still in git. History is not rewritten.
2. **Make the tool date from history.** `ledgerCoverage` reads, for each unit, the newest commit that changed a file under the unit, with no trailer needed. The dates are exact, but the rule that a trailer dates only what a pass read is weakened, since a commit that touched a file is now taken as a sweep of it. That is a behaviour change to the tool and to `.agents/skills/sweeps/references/one-pass.md`.
3. **Leave the rows open and accept the re-sweep.** The units stay `—`, and a later pass reads them again with a trailer. This costs a second read of about twenty small files and keeps the rule unchanged.

Rewriting the pushed sweep commits to add trailers is ruled out: `ai/queue` is not rewritten.

## Out of scope

Changing the trailer convention for future sweeps. Every sweep commit from here on carries its trailer, as the `sweeps` skill already requires.
