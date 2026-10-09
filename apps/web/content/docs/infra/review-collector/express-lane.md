---
title: Express lane
description: A commit that claims it needs no review — the Express trailer the reshaper writes or a session writes itself — goes straight to main, unverified, instead of spending a review window's file budget — a red it leaves is the repairer's, a later commit that builds on it takes it into the window, and one that never applies is parked past its attempts, or at once when nothing in flight can move main.
---

# Express Lane

A review window is budgeted in **files** and spent on **findings**. A folder sweep, a one-rule substitution across the tree, a regenerated corpus each invert that trade: the largest things the queue produces and the emptiest a reviewer reads. So a commit that claims nothing in it needs review never occupies a window — it is cherry-picked onto `main`, and the [fold](/docs/infra/review-collector/collection-cycle) carries `main` into the next window while the sync drops the original from the queue by the copy that names it.

## The claim

The claim is one trailer line, `Express: <one sentence on why nothing in it needs a reviewer>`, on a queue commit. Two hands write it:

- **The reshaper**, on the parts of an over-cap commit it judged need no review — the commit's author is asked for nothing ([sync](/docs/infra/review-collector/collection-cycle)).
- **A session**, on a commit it knows to be a sweep's moves or a format pass, which skips the reshaper's session outright.

A claim is never a proof, and nothing gates it. The cut is pushed to `main` as it applies, with no checks run on it: a gate there was a blocker with no end. A claimed commit that is red on its own is most often made green by the commit after it — the sweep's moves, then the import order the moves left behind — and that next commit cannot apply without the claimed one, so a verified cut held the claimed commit off `main` while the port held its fix off `develop`, forever. Unverified, the claimed commit lands, `main`'s own CI reads it, and a red it leaves is the [repair](/docs/infra/review-collector/repair)'s like any other red that lands on `main` unread. An intermediate red `main` is accepted; a stage that cannot resolve is not.

The cut goes first even over a red `main`, because a claimed commit may be the repair — a session's own, or the one an issue asks for once a red is past the repairer's attempts — and it reaches `main` this way alone. Whether `main` is red is asked last in the pass, after the walk and the openings ([repair](/docs/infra/review-collector/repair)).

## A claim that never applies

A skipped commit waits on the unported work it needs, and most get it: the windows carry that work to `main`, and a later cut applies. Some never do — a size snapshot whose line `main` rewrites with every bundle change, an edit to a file `main` has since deleted — and the lane would wait on them forever, reported only in an idle run's reason. So every skip is counted against the attempt cap (`SESSION_ATTEMPT_CAP`) in a marker on the commit itself, naming the collector's own source as its basis, as the sync's and the reshaper's counts do ([the runner's counts](/docs/infra/review-collector/runner)). **A skip is counted once per `main` head, never once per run.** A cherry-pick onto the same head is the same pick, and runs fire on every push and review event, so a count per run would park a commit one window away from what it needs within minutes; a head that moves and still refuses the commit is a fresh attempt, so a commit waiting on a window in flight gets the windows that merge meanwhile. Past the cap the commit is parked as a commit no window can carry is: pushed to its own held branch, named in one issue ([the collection cycle](/docs/infra/review-collector/collection-cycle), "Sync"), and owed nowhere from then on, so its claim drops out of the lane and out of the idle reason with it. The issue asks for the re-land without the `Express:` trailer, so a window carries the commit in queue order, after the work it was waiting on.

**A quiet queue parks a claim at once.** A count per head waits on heads that only come while something is in flight. With no window open, nothing else owed to cut, and `main` still where the lane met the claim — a walk that merged the last window this run has moved it, and that push runs the lane again — nothing can move `main` under the claim, so the head it failed on is the last it would meet: the opener parks it then, as the cap would, rather than count it on heads that never come.

```mermaid
flowchart TD
  C[A commit the queue owes main and develop] --> T{Carries an Express trailer}
  T -->|no| RV[Review lane]
  T -->|yes| EX[Cherry-pick onto main, in queue order<br/>a patch that does not apply is skipped]
  EX -->|something applied| PU[Push main unverified — exit, the push re-fires the cycle]
  EX -->|nothing applied| MR[The walk and the openings,<br/>then the repair if main is red]
  PU --> CI[main's CI reads it — a red is the repairer's]
  PU --> FO[Next window: the fold merges main in<br/>the sync drops the original by its copy]
  EX -->|skipped| AT{Skipped on the cap's worth<br/>of main heads already}
  AT -->|no| WT[Counted once for this head, and waits]
  WT -->|no window open, none to cut,<br/>main unmoved this run| PK
  WT -->|a later owed commit conflicts without it| CA[The port carries it into the window]
  AT -->|yes| PK[Parked on ai/held/* with one issue —<br/>owed nowhere, its claim dropped]
```

## What the lane does not do

- **It does not preserve queue order.** A trailered commit stuck behind unported work is the one worth taking early; a commit whose patch needs an unported one cannot apply, so the cherry-pick refuses it and the lane moves on. A patch that lands proves only that it landed: a cut can apply over `main` and still fail typecheck on a line an unported predecessor changes — that red is `main`'s CI's to find and the repairer's to answer, and the release that carries the predecessor ends it.
- **It does not close while a window is in flight.** `main` moving under `develop` is the fold's case, and the fold always lands — the lockfile rebuilt, any other conflict the resolver's. A copy a window already carries is owed to neither branch, so it is never cut a second time.
- **It does not push twice in a run.** The push fires the cycle again; whatever else the run would have done waits for that event.
- **It does not let a claim hold what builds on it.** The port skips every trailered commit, so nothing behind one waits on it — until an owed commit cannot apply without the claimed commits ahead of it. Then the port picks those, then the commit, and the window carries them all: the claim bought a review exemption, never a place its dependents cannot reach. A claimed commit the window carries is owed to `develop` no longer, so the lane never cuts it too.

## Key files

| File                                                               | Role                                                                                         |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `scripts/src/services/coderabbit/collect/runExpressLane.ts`        | the lane as one step of the cycle — build the cut and push it                                |
| `scripts/src/services/coderabbit/collect/readClaimedShas.ts`       | which owed commits claim the lane                                                            |
| `scripts/src/services/coderabbit/collect/readCherryShas.ts`        | what is owed at all — by patch id, and by no copy naming any identity the commit has carried |
| `scripts/src/services/coderabbit/collect/portExpress.ts`           | the candidate on `main`                                                                      |
| `scripts/src/services/coderabbit/collect/readTrailedShas.ts`       | which of a set carry a trailer, in one read                                                  |
| `scripts/src/services/coderabbit/collect/settleUnappliedClaims.ts` | a claimed commit no cut applied, counted once per `main` head and parked past the cap        |
| `scripts/src/services/coderabbit/collect/openNextWindow.ts`        | a quiet queue's claims parked at once, with nothing in flight to move `main`                 |

## Notes

- **Rejected: admitting a commit by a proof about its diff** — every file a byte-identical rename or an import-only edit, none at a path something reads by location. The proof admitted only what nobody needed judged, a clean sweep commit almost never happens in practice, and the lane it guarded closed whenever a window was in flight. Judgement about what needs review is the session's.
- **Rejected: verifying the cut before the push.** It was the lane's gate until a claimed commit red on its own, fixed by the unclaimed commit after it, held both lanes at once — the lane refused the one and the port could not apply the other. Every red `main` resolves through the repairer, so the gate bought nothing a later run does not.
- **Rejected: a claim that waits however long its patch takes to apply.** The lane's skip was free while every claim it skipped eventually applied, and a handful never did, each holding nothing but its own place while the collector reported it run after run. The goal is a collector that finishes unattended, so a wait with no end is routed around as every other capped step's is, and the cost is a commit re-landed through a review it claimed it did not need.
- **The lane is measured in files it removes from a window, not in reviews it avoids.** CodeRabbit reads a pure rename and says nothing either way; what it buys is the budget that rename was occupying.
