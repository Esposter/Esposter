# Sittings and Convergence

Read when planning a sitting — when a pass crosses into another ledger or finishes an area, when a finding lands in a
file another session is editing, and why a resume that reports nothing is the sweep paying rather than failing. The rules a pass applies are in `SKILL.md`.

## The review budget is not the session's to measure

A sitting never sizes itself to a review window. Each review run cuts its window to fit under the file cap; the review owns the cap and the cut (`openspec/specs/infra/review/design.md`, step 4). A session that counted files against the cap would be keeping a second copy of a number the constant
already holds — the copy that goes stale the day the plan changes. The session's bound is the unit: one unit per
commit, every unit read whole.

## `/finishing` runs at every area boundary

When a sitting finishes one area's units (app shell, messaging, packages, …) and before it starts the next, it runs the audit over that area's commits (`finishing` skill). A rename leaves a docs sentence behind and a repeated finding wants its enforcer, and both are cheapest to catch while the area is still in mind. The audit is not the checks, which still wait for the push.

## A finding in another session's file waits for that session's commit

A tracked file another session has modified and not yet committed is that session's, and a pathspec commit cannot keep the two sessions' hunks apart (the `git` skill, `references/shared-checkout.md`). The pass leaves it until that session commits it, then edits it like any other file, and never stashes or resets to clear the way. A tracked file only this session has edited goes in with the unit. An untracked file that depends on the other session's other new files stays in the tree for that session to commit, because committing it alone ships half their feature. Reverting a correct change only to stay out of the way loses the change.

## Re-running converges

A resume that reports nothing reads like effort spent for no return, and it is the opposite. What a pass costs to
review is **files changed**, and what spends that is **findings**: a unit reported clean changes no file at all. So
as the density of findings falls, the same review window carries more units, and each cycle reaches further into
the tree than the last.

That is what the coverage dates make visible, and it is why a convention is swept again rather than declared done.
A pass that finds nothing is the sweep having converged **there**, recorded as a date so the next cycle starts from
it instead of re-reading it.

This is not the treadmill `references/handing-to-an-enforcer.md` rejects. What must never repeat is a pass
**re-deriving** a rule a machine could decide; that work is handed to an enforcer and leaves the sweep's scope for
good. A reading pass whose findings thin out each cycle is the opposite shape: each cycle is cheaper than the last,
and it ends.

## A sitting reads units, not ledgers

A ledger is not finished in a sitting. Every sweep is standing and most questions hold more cells than any one
sitting reads, so "work this ledger until it is done" is not a plan. **A question left half-drained is the normal
resting state**, and a sitting reads units rather than ledgers: every question holding a unit is judged on the one
read of it.

What may not be split is a **unit**. A cell is swept and dated in this sitting or untouched — the same rule that
denies a partially-swept state denies a half-read one, and a unit abandoned mid-read leaves the next sitting unable
to tell what was already looked at.

The handover names the units left, so the next sitting opens on a unit rather than re-deriving scope.

## One read, several questions

A sitting loads a unit once and judges it against each question whose `Scope` holds it, one question at a time and only for that question's files in it, writing one `Ledger:` trailer per question. A merged checklist of every question at once is a skim: twenty questions read past what one would find.

## Sampled clean

`pnpm ai:sweep:sample` draws the next sample: thirty open cells per question, or every one where a question holds fewer, taken by units with the rarest question first, each unit printed with the questions it is judged for. A sample sitting runs these steps in order, with one directory for its batch files and the readers' output, and one for the fixers':

1. `pnpm ai:sweep:sample > sample.txt`: the draw, saved to a file.
2. `pnpm ai:sweep:batch sample.txt <directory>`: batch files `01.txt`, `02.txt`…, each holding whole units up to twenty judgements (`--judgements`).
3. One reader per batch, writing its judgements beside it as `<n>.jsonl` (`references/sample-reader.md`).
4. `pnpm ai:sweep:record <directory> --fixer <fixers>`: the `Ledger:` trailer of every cell its readers judged clean, once each, and the other cells written as fixer units, `01.json`…, each holding whole units up to forty findings (`--findings`).
5. One fixer per fixer unit file, writing its outcomes into `<n>.result.jsonl` beside it (`references/sample-fixer.md`).
6. `pnpm ai:sweep:sampled sample.txt <fixers>`: one `Sampled:` trailer per question, for the record commit that ends the sample.

Each cell is a full pass with its own trailers, and the sitting counts each question's **defects**: findings a fixer fixed in the code or settled in the rule that owns it, the `fixed` and `skill` outcomes. A refuted finding and a tidy are not defects. The `Sampled:` size is the cells the sample drew for the question. While a question's latest sample found none, `pnpm ai:sweep:status` lists its unread cells as `sampled`: undated, and owed again on a `Reopens:` naming them or their question, or a commit touching a path they name. Zero defects in `n` bounds the rate below about `3/n`, so sample at least thirty; the tidies left behind drain with the next edit (`references/draining.md`).
