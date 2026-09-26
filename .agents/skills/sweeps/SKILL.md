---
name: sweeps
description: Apply when running, resuming, ticking, adding or retiring a repo-wide sweep or its ledger, or when deciding whether a mechanical pass needs one. Esposter repo-wide sweep conventions — progress as a ledger in .agents/ledgers/ named after the owning skill, a find recipe proven able to fail, one behaviour-preserving unit per commit with the Ledger trailer dating its row and naming its model through ai:sweep:ledger-coverage, a row an older model read open for a full pass, every sweep standing and resumed from the index row's Scope, a sitting that crosses ledgers rather than finishing one, and a repeated finding handed to an enforcer.
---

# Sweeps

A **sweep** carries one already-settled convention across a tree too large to finish in one commit. It decides nothing: the convention is owned by a skill or docs page, and the sweep only applies it to code that predates it, changing no behaviour.

Each sweep's progress is a **ledger**: one file in `.agents/ledgers/`, one row in its `README.md` index. A ledger that outgrows a screen, or that two agents want to work at once, becomes a folder of one file per area — the index row still carries the metadata, each area file is a coverage table and nothing else, and everything else the ledger holds moves to the folder's own `README.md` (`references/ledger-files.md`). It grows the way source does: split when a unit earns its own home, never to hit a number.

**A ledger is named after the skill that owns its rules**, where one skill does — `pinia`, `naming`, `trpc`, `testing`. A second name for the same subject makes the ledger and the skill read as two topics, and the index row is where the pairing is stated. A ledger several skills own takes the name of the question instead (`schemas`, `styling`). Areas inside a promoted folder reuse the area names another ledger already established, so "was this area swept, for which question, and when" reads off one set of names.

**A sweep is never a proposal.** A proposal designs behaviour that does not exist yet and is deleted when it ships; a sweep changes no behaviour at all. Filing one under `apps/web/content/docs/proposals/` mislabels maintenance as design and puts a never-ending standing sweep in a folder whose contents are all supposed to leave.

## Settled — do not re-propose

- **Filing a sweep under `apps/web/content/docs/proposals/`.** A sweep changes no behaviour and never ends, so it is repo state in `.agents/ledgers/` rather than something that leaves when it ships (`apps/web/content/docs/proposals/index.md`).
- **A progress column, percentage or tick count on the index row.** A rolled-up number is a second copy of the truth that drifts, and it turns every pass into a write to the one file every other pass is also writing. State lives at the leaf (`references/one-pass.md`).
- **Fanning the units of one sweep out to parallel agents.** A sweep reads a whole tree to change a fraction of it, and delegation is priced by files read rather than files changed; a parallel pass also throws away the carve-out that the first unit teaches every unit after it. Main session, one unit at a time (`references/one-pass.md`).
- **Dating the `Swept` cell by hand in the sweep commit.** It is a second file in every sweep commit, the one every other pass is also writing, and it is the part a pass forgets; the commit's trailer dates the row and `pnpm ai:sweep:ledger-coverage` writes it in (`references/one-pass.md`).
- **An empty commit to carry a clean unit's trailer.** The porter's cherry-pick fails on an empty commit and skips it, so the trailer never reaches a window and the commit rides the queue through every rebase; the trailer goes on the sitting's next commit (`references/one-pass.md`).
- **A test holding the `Swept` dates to the trailers.** CI checks out one commit deep, so there `git log` holds no trailer and the test would reopen every row; the rows are held to the tree (`scripts/src/workspace/ledgerUnits.test.ts`) and the dates are written at the sitting.
- **Running `ai:sweep:ledger-coverage` from a git hook.** Before the commit it rewrites a ledger the commit did not stage; after it, the ledger is a change the commit just closed. The sitting runs it, at the start and at the end (`references/standing-resume.md`).
- **Deriving a hand-unit ledger's rows from its directories.** A unit is sized to what one pass can read, and a directory is not that size; only a ledger whose units are the tree's own entries (`LedgerUnitsMap`) derives its rows (`references/ledger-files.md`).
- **Deriving a row's reopen from its pages' `Key files` dates.** A source carrying a commit newer than the page naming it reads like drift and is not: over `content/docs` it flagged more than half the pages that have a table, every one of them inside the same handful of days — the last tree-wide pass showing through, not prose that had gone wrong. Rolled up to rows it emptied half the coverage table. Most commits to a file change nothing any page says, so the comparison is a clock rather than a signal, and a ledger that is always open is read by nobody; a behaviour change declares its own reopen with the trailer (`references/ledger-files.md`).
- **Inheriting a split row's date onto the children.** The parent was split because it could never have been read, so carrying its date down records the skim as coverage. Children reopen at `—` (`references/ledger-files.md`).

## The find recipe — `references/find-recipes.md`

**Prove the scan can fail before believing it passed** — run it against a known violation; an empty result is the same shape as a clean tree. A grep stays inline in the ledger; anything with control flow is a script under `scripts/src/sweeps/` run as `pnpm ai:sweep:<scan>` (the rule is the `skill-authoring` skill's), where a colocated test keeps "prove the scan can fail" proved. **Writing one, or moving one out of a code block**, is that page.

## One pass

Behaviour-preserving only, one unit per commit with a `Ledger: <ledger> | <unit>` trailer, a clean unit's trailer riding the next commit, and the checks once when the sitting goes out — the loop and every rule inside it are `references/one-pass.md`.

## The ledger file — `references/ledger-files.md`

A ledger holds six things and no explanatory prose, and is keyed by the question it asks rather than by the files it reaches. **Writing, splitting, merging, promoting or retiring one**, deciding whether a mechanical pass earns a file at all or whether a new convention joins an existing ledger, and sizing a unit to what one pass can read, is that page.

## Every sweep is standing

There is no one-shot mode: a row carries a date and the model that read it, a pass resumes from what changed since over the index row's `Scope`, and a row an older model read is open for a full pass (`references/standing-resume.md`).

## A sitting crosses ledgers — `references/windows-and-convergence.md`

A ledger is not finished in a sitting, and a sitting does not stop at one. When the ledger being worked runs out of
open rows, take an open row from another — and never leave a unit half-read. **Planning a sitting**, and why a
resume that reports nothing is the sweep converging rather than failing, is that page.

## Draining beats scheduling

**A change that edits a file inside an unswept unit sweeps that file first**, in its own commit ahead of the behaviour change, and leaves the row `—` (`references/draining.md`).

## When the rule runs out — `references/rule-gaps.md`

The convention a pass carries is evidence rather than authority: a unit that will not fit it is as likely to have found a gap as to be a violation. **The three shapes a gap takes**, and where the fix lands, are that page.

## Shrinking beats re-running

**A sweep shrinks by handing what is decidable to an enforcer**, and the second time a pass writes the same finding it writes the enforcer instead; which part earns one is the `oxlint` skill's decision tree (`references/handing-to-an-enforcer.md`).

## Reference pages

- `references/one-pass.md` — when running a pass: the loop, the `Ledger:` trailer, a clean unit's trailer, and when the checks run.
- `references/draining.md` — when an ordinary change edits a file inside an unswept unit.
