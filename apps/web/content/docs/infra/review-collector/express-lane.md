---
title: Express lane
description: A commit that claims it needs no review — the Express trailer the reshaper writes or a session writes itself — goes straight to main once the checks pass, instead of spending a review window's file budget.
---

# Express Lane

A review window is budgeted in **files** and spent on **findings**. A folder sweep, a one-rule substitution across the tree, a regenerated corpus each invert that trade: the largest things the queue produces and the emptiest a reviewer reads. So a commit that claims nothing in it needs review never occupies a window — it is cherry-picked onto `main`, and the [fold](/docs/infra/review-collector/collection-cycle) carries `main` into the next window while the sync drops the original from the queue by the copy that names it.

## The claim

The claim is one trailer line, `Express: <one sentence on why nothing in it needs a reviewer>`, on a queue commit. Two hands write it:

- **The reshaper**, on the parts of an over-cap commit it judged need no review — the commit's author is asked for nothing ([sync](/docs/infra/review-collector/collection-cycle)).
- **A session**, on a commit it knows to be a sweep's moves or a format pass, which skips the reshaper's session outright.

A claim is never a proof. Nothing reads it as true, only as asked: what admits the commit to `main` is the checks — install, format, the package builds, typecheck, both linters and the tests (`EXPRESS_VERIFY_COMMANDS`) — run on the cut as it would land, and a red cut takes the review lane instead. The app build alone is left to `main`'s own CI: it is the longest job there, and nothing a cut ships waits on it.

```mermaid
flowchart TD
  C[A commit the queue owes main and develop] --> T{Carries an Express trailer}
  T -->|no| RV[Review lane]
  T -->|yes| EX[Cherry-pick onto main, in queue order<br/>a patch that does not apply is skipped]
  EX --> V{The cut passes the checks}
  V -->|no| RD[Note it once on each commit<br/>tried again next run — the port skips it]
  V -->|yes| PU[Push main — exit, the push re-fires the cycle]
  PU --> FO[Next window: the fold merges main in<br/>the sync drops the original by its copy]
```

## What the lane does not do

- **It does not preserve queue order.** A trailered commit stuck behind unported work is the one worth taking early; a commit whose patch needs an unported one cannot apply, so the cherry-pick refuses it and the lane moves on. Dependency is enforced by whether the patch lands, not by an ancestry check the cherry-pick never makes.
- **It does not close while a window is in flight.** `main` moving under `develop` is the fold's case, and the fold always lands — the lockfile rebuilt, any other conflict the resolver's. A copy a window already carries is owed to neither branch, so it is never cut a second time.
- **It does not push twice in a run.** The push fires the cycle again; whatever else the run would have done waits for that event.
- **It does not hand a claimed commit to a window.** The port skips every trailered commit, so nothing behind one waits on it. A cut the checks refuse is noted once on each commit it carried and tried again every run — a later commit reaching `main` may be what it needed — and the person drops the trailer to have it reviewed, or repairs it. The third and last residual case.

## Key files

| File                                                           | Role                                                           |
| :------------------------------------------------------------- | :------------------------------------------------------------- |
| `scripts/src/services/coderabbit/collect/runExpressLane.ts`    | the lane as one step of the cycle — build, verify, push        |
| `scripts/src/services/coderabbit/collect/portExpress.ts`       | which owed commits claim the lane, and the candidate on `main` |
| `scripts/src/services/coderabbit/collect/readTrailerValues.ts` | the claim, read off the commit                                 |

## Notes

- **Rejected: admitting a commit by a proof about its diff** — every file a byte-identical rename or an import-only edit, none at a path something reads by location. The proof admitted only what nobody needed judged, a clean sweep commit almost never happens in practice, and the lane it guarded closed whenever a window was in flight. Judgement about what needs review is the session's, and the checks are the gate either way.
- **The lane is measured in files it removes from a window, not in reviews it avoids.** CodeRabbit reads a pure rename and says nothing either way; what it buys is the budget that rename was occupying.
