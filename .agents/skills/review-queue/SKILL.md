---
name: review-queue
description: Esposter's review queue — the session's side of the review collector. A Settled list of the directions already rejected (per-chunk feature branches, pushing develop by hand, cutting or measuring a window in the session, holding a finished chunk until the checks come back, excluding files to fit a window, opening the release pull request by hand, merging main or develop into ai/queue, merging a clean release by hand), the refs and their one writer each (the session writes only ai/queue), the loop (commit a unit, push after every commit with --force-with-lease after a rebase, fetch and rebase onto origin/develop before the next unit and why that keeps the drain's fixes), committing a sweep's moves apart from its repairs so the express lane can take them, answering a finding in-session with the Answers / Drains trailers and where that fix ports, a held first commit failing the collector's run red until the session rebases (onto origin/ai/review-fixes for a conflict with parked fixes) or splits it, main being synced by the collector and a clean release merging itself, undoing a merge that got into the queue with a forced rebase, and running the collector by hand only with its workflow disabled. Apply before any git push, when deciding what branch a commit lands on, when the collector has moved develop, when a CodeRabbit finding is being fixed in the session, when a collector run is red, or when the collector is switched off.
---

# Review Queue

The session works on **one permanent branch, `ai/queue`**, and pushes it after every commit. The review collector — `pnpm ai:coderabbit:collect`, run by the `ReviewCollector` workflow on every queue push and every CodeRabbit event — drains open findings onto `ai/review-fixes`, cuts the largest window under the cap from the queue, fast-forwards `develop` by it, opens the `develop` → `main` pull request once a window is worth its first review, and replies on every thread with the pushed sha. Merging that pull request is the one act left to a person. The mechanism is `apps/web/content/docs/infra/review-collector/`; this skill is what the session does.

## Settled — do not re-propose

- **Per-chunk feature branches.** Nothing gates entry to `develop` but the collector, so a branch per chunk only adds a merge that buys nothing; the queue is linear history, and a window is cut at commit boundaries.
- **Pushing `develop` by hand**, rate-limited or not. `develop` has one writer, the collector, and a hand push races its compare-and-swap and spends a review slot the collector was holding for a full window.
- **Measuring or cutting a window in the session** — reading the last reviewed sha, counting files since it, pushing a prefix by sha. The collector measures the cut on the tree it is about to push, one cherry-pick at a time; a commit that would have been "the last one under the cap" is just a commit.
- **Holding a finished chunk until `format`/`typecheck`/`lint`/tests come back.** A queue push spends nothing, and a repair found afterwards is one more commit behind the unit. Push the unit, run the checks in the background, commit the repairs.
- **Excluding files to bring a window under the cap.** The collector holds the overflow for the next window; an exclusion hides the work from the only review it will ever get.
- **Opening the release pull request by hand.** The collector opens it at the same fill target a push clears; a session that opens one spends the slot on a handful of files.
- **Merging `main` or `develop` into `ai/queue`.** A merge is never linearised away — `git rebase origin/develop` is a no-op once `origin/develop` is an ancestor — and it blinds the porter: `git cherry` matches patch ids against the commits upstream has and the queue lacks, which a queue containing upstream leaves empty, so every already-ported commit reads as owed and the first one conflicts. The queue catches up by rebase only.
- **Merging the release pull request by hand when its review is clean.** The collector merges it the moment a review at the head leaves nothing open with the least merge risk; a person merges only one the bot rates riskier.

## The refs, one writer each

| Ref               | Written by                                                                                        | What it holds                                                                   |
| :---------------- | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| `ai/queue`        | the session                                                                                       | its linear history — every unported commit in authoring order, no window cuts   |
| `develop`         | the collector                                                                                     | the reviewed frontier plus at most one unreviewed window, moved by fast-forward |
| `ai/review-fixes` | the collector                                                                                     | fixes a drain produced that no window has carried yet                           |
| `main`            | the collector merging a clean release or cutting the express lane, a person merging a riskier one | the released trunk, plus the commits that never needed a window                 |

The session never checks out `develop` for work, never touches `ai/review-fixes`, and never cuts a window.

## The loop

1. **Commit a unit on `ai/queue`.** Run the finishing checks in the background and commit their repairs as their own commit behind the unit — the collector cuts at commit boundaries, so every cut must be green on its own.
2. **`git push` after every commit.** Plain while the queue sits on `develop`'s head, `--force-with-lease` after a rebase: the queue is a backup of unpushed work, not a reviewed artifact, and the lease is what keeps two machines from dropping each other's commits. A queue push spends nothing, so the standing rule that a push is asked for every time is `develop`'s — which the session never pushes.
3. **Before the next unit, `git fetch`, and when `origin/develop` moved, `git rebase origin/develop`.** A fast-forwarded `develop` makes the rebase a no-op; a cherry-picked window drops the ported commits by patch id and re-parents the rest. **This is what keeps the drain's fixes:** a queue left on an old base carries commits written against files the drain has since repaired, and the porter's cherry-pick replays them — where the hunks overlap the window is held, where they merely sit nearby the queue's older shape lands on top and the fix is gone with nothing reporting it. A queue several windows behind is reconciled commit by commit, so budget it as work.
4. **Keep working.** The collector fires on the push and does the rest; its replies name the pushed sha.

**Commit a sweep's moves apart from its repairs.** The collector's express lane sends a commit that provably has nothing to review — a folder sweep's moves and the imports that follow them — straight to `main`, out of queue order, so a sweep stops eating a budget counted in files. The proof is per commit, so a commit carrying the renames _and_ the refreshed size snapshot has one content change in it, and one is enough.

## Answering a finding in-session

A finding the session fixes itself is a commit on `ai/queue` carrying the trailer `Answers: <comment id>` (a body-only finding: `Drains: <review id>`). The collector's open-finding predicate honours a trailer on the queue's unported commits, so it neither re-fixes the finding nor replies before the commit is on `develop`. It ports in queue order, not first — only `ai/review-fixes` commits lead a window — so the wait is the cost of answering in-session rather than leaving the drain to it. A rejection needs no sha and may be replied to directly; the reply's shape is the `coderabbit` skill's.

**When the collector's run fails red naming a held commit** — the queue's first owed commit conflicts with the tree the porter builds on, or overflows the cap alone — the queue is the session's to repair, and every run stays red until it is. A conflict with parked fixes (they changed a file the queue's next commit also changed) is rebased onto `origin/ai/review-fixes`, not onto `develop`: the fixes will lead the next window, and the porter reads what the queue owes against the tree the fixes built, so the copies the queue carries are ancestors rather than picks. A conflict with `develop` itself is the ordinary rebase of step 3. A commit over the cap alone is split.

## `main` is synced by the collector

After the release pull request merges — by the collector, once a review at the head is clean with the least merge risk, or by a person otherwise — the push to `main` runs the cycle and `develop` is fast-forwarded to it; a dependency bump that lands on `main` alone is folded into the next window as a merge commit. Nothing is owed by the session after a merge; the queue keeps filling from the new merge base, and the next `git rebase origin/develop` drops the ported commits by patch id. **Never merge `main` or `develop` into `ai/queue`** (Settled): a queue that already carries upstream is one `git cherry` cannot patch-match, so the porter re-picks ported commits and holds on the first conflict. A merge that got in is undone by `git rebase --force-rebase origin/develop`, which replays the queue's own commits and drops the ported ones as empty; conflicts are resolved commit by commit, and `git diff <old head>` afterwards proves the tree unchanged but for what `main` brought.

## Running the collector by hand

Only with its workflow off: `gh workflow disable ReviewCollector.yaml` stops every trigger, and `pnpm ai:coderabbit:collect` then runs the same cycle from a checkout whose `gh` login is the collector's account — never this checkout, which the script switches branches in and refuses when dirty, but a detached `git worktree add` on `origin/develop` with its own `pnpm i` and `@esposter/shared` build. The run is asked for, like any push to `develop`. `gh workflow enable ReviewCollector.yaml` hands the cycle back, and from then on it is never also run by hand: the compare-and-swap refuses the loser, but the drain the loser ran was a Claude session spent for nothing. `--dry-run` needs none of this: it ports into a throwaway worktree, pushes nothing and runs no Claude session.
