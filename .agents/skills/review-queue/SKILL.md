---
name: review-queue
description: Apply when about to git commit or git push, when deciding what branch a commit lands on, when the collector has moved develop or rewritten ai/queue, when a CodeRabbit finding is being fixed in the session, when the collector opens an issue or a collector run is red, or when the collector is switched off. Esposter's review queue — the agent's side of the review collector: one permanent branch ai/queue, each agent's commits made in its own worktree and landed by git pull --rebase then git push, a rebase conflict settled by the agent that made the commit, and the collector's windows and fixes left to the collector.
---

# Review Queue

Every agent works on **one permanent branch, `ai/queue`**, from its own git worktree, and lands its commits on it with `git pull --rebase` and `git push`. The review collector — `pnpm ai:coderabbit:collect`, run by the `ReviewCollector` workflow on every queue push and every CodeRabbit event — merges the bottom window of the stack of open `review/<n>` pull requests the moment its one review completes, drains that review's findings onto `ai/review-fixes`, **rewrites `ai/queue` onto the tree the next window is built on** (a conflict resolved by its own Claude session), cuts the largest window under the cap from the fixes and the queue, pushes it as its own `review/<n>` branch, fast-forwards `develop` to it, replies on every answered thread with the pushed sha, and opens its pull request on the stack (Settled). The mechanism is `apps/web/content/docs/infra/review-collector/`; this skill is what an agent does.

## Settled — do not re-propose

- **Per-chunk feature branches.** Nothing gates entry to `develop` but the collector, so a branch per chunk only adds a merge that buys nothing; the queue is linear history, and a window is cut at commit boundaries.
- **Pushing `develop` by hand**, rate-limited or not. `develop` has one writer, the collector, and a hand push races its compare-and-swap and spends a review slot on a range nothing measured against the cap.
- **Measuring or cutting a window in the session** — reading the last reviewed sha, counting files since it, pushing a prefix by sha. The collector measures the cut on the tree it is about to push, one cherry-pick at a time; a commit that would have been "the last one under the cap" is just a commit.
- **Holding a finished chunk until its tests or CI come back.** A queue push spends nothing, and a repair found afterwards is one more commit behind the unit. Push each unit as it lands, run the touched tests once in the background after the sitting's last edit, and commit what they call for behind the unit; the rest is CI's (the `running-checks` skill).
- **Excluding files to bring a window under the cap.** The collector holds the overflow for the next window; an exclusion hides the work from the only review it will ever get.
- **Opening a window's pull request by hand.** The collector opens it on the same pass that pushes the window's branch, over the range it just measured and on top of the stack; a session that opens one races that push, so the first review reads a range nothing cut to the cap.
- **Merging `main` or `develop` into `ai/queue`.** A merge is never linearised away — a rebase onto `origin/develop` is a no-op once `origin/develop` is an ancestor — and it blinds the porter: `git cherry` matches patch ids against the commits upstream has and the queue lacks, which a queue containing upstream leaves empty, so every already-ported commit reads as owed and the first one conflicts. The queue catches up by `git pull --rebase` only.
- **Rebasing `ai/queue` onto `origin/develop` or `origin/ai/review-fixes` by hand.** The collector rewrites the queue onto that tree itself after every window, with its own Claude resolving what conflicts (`apps/web/content/docs/infra/review-collector/collection-cycle/sync.md`, "Sync"). A hand rebase races that rewrite — two rewrites of one ref, and a `--force-with-lease` whose lease is the fetched ref overwrites the collector's copy with nothing reporting it. There is no exception: `main` and `develop` have no writer outside the collector, whose repair answers a red `main`, so no hand repair leaves the queue measured from a stale merge base.
- **Syncing by reset — `git reset --hard origin/ai/queue`, and a reset followed by cherry-picking what `git cherry` calls owed, stay rejected.** `git cherry` matches patch ids, and the collector's conflict resolution changes a ported commit's patch id while keeping its subject, so the list cannot tell a commit the remote already carries from one it lacks. The reset throws the local history away on that guess. The rebase keeps it: each conflict stops on one commit with both sides in view, and the agent that made the commit settles it (`references/pull-conflicts.md`).
- **Holding a window until its checks go green.** The review is the gate, never CI — a red check at that point is a snapshot, a lint rule or a bundle, and it lands as a commit in a later window (`apps/web/content/docs/infra/review-collector/index.md`).
- **Merging a window's pull request by hand, or holding it for its findings.** The collector merges the bottom window the moment its one review completes, whatever the review found — held only while Claude Code is out of session, since nothing could then drain them; the findings are the next window's, fixed on `ai/review-fixes` and read by that window's own full review. A person's one lever is closing a window without merging, which pauses the collector (`apps/web/content/docs/infra/review-collector/index.md`).
- **Landing a collector change over several pushes while its workflow runs.** Every run checks out the `ai/queue` head, so a queue push is a deploy, and a change pushed in parts runs half-landed — run 37952229125 spent a $5.92 session and then threw on the mismatch, pushing nothing it paid for. A collector change is made with the workflow disabled and lands in one push (`references/running-by-hand.md`).

## The refs

Every ref has one writer, and the session's is `ai/queue` alone — its linear history, every unported commit in authoring order, no window cuts. The session never checks out `develop` for work, never touches `ai/review-fixes` or a `review/<n>` branch, and never cuts a window; who writes the rest is `apps/web/content/docs/infra/review-collector/two-writers.md`.

## The loop

An agent's commits never go through the main checkout. Each agent:

1. **Sets up a worktree on the queue.** `git worktree add ~/Esposter/wt/<name> origin/ai/queue` (detached), then in it `pnpm i --prefer-offline` and `vp run build:packages`. A failing `nuxt prepare` postinstall does not stop the agent: the packages still link, and the app's prepare is only the app's concern.
2. **Commits each coherent unit in the worktree, by pathspec.** The touched tests run once after the sitting's last edit, in the background (the `running-checks` skill), and what they call for is its own commit behind the unit, so every cut the collector makes is green on its own.
3. **Lands the commits:**

```bash
for attempt in 1 2 3 4; do git pull --rebase origin ai/queue && git push origin HEAD:ai/queue && break; done
```

A rebase conflict stops the loop on the commit it stopped on. The agent resolves it, since it knows its change, runs `git rebase --continue`, and pushes. Only a rejected push retries: at about ten pushes an hour the first one often races the collector or another agent.

4. **Removes the worktree** once its commits have landed: `.agents/skills/throughput/scripts/remove-worktree.sh`.

**Worktrees live on the drive of the pnpm store.** `~/Esposter` is on that drive, so pnpm hard-links from the store instead of copying: a filtered worktree measured 0.31 GB beyond the store.

**The main checkout is not edited by agents.** It only fast-forwards with `git pull --rebase`, which with no local commits is a fast-forward. Never `reset`, cherry-pick or stash in it.

**The collector's rewrite is caught up by the pull.** After each window it ports, the collector rewrites `origin/ai/queue` onto the tree the next window builds on. `git pull --rebase` then replays the agent's local commits the new base does not already carry, skipping by patch-id the ones ported unchanged, and a ported commit the collector changed comes back as a conflict the agent settles.

**Never `git stash`, `git add -A`, or a bare `--force-with-lease`.** Commits are pushed plain.

**Commit in any shape; an `Express:` trailer is optional.** The collector repackages a commit no window can carry itself, and parks one it still cannot past its attempts, and its express lane sends any commit carrying the trailer `Express: <why nothing in it needs a reviewer>` straight to `main`, out of queue order and unverified — a red it leaves is the repairer's, a later commit that builds on it carries it into the window, and one no cut applies past its attempts — at once, in a queue with no window open — is parked. A session that knows a commit is a sweep's moves, a format pass or a regenerated `generated/` folder may write the trailer (`git commit --trailer "Express: …"`) and skip the collector's session; one that does not is asked for nothing. The lane is `apps/web/content/docs/infra/review-collector/express-lane.md`.

## Answering a finding in-session

A fix the session makes itself is a commit carrying `Answers: <comment id>` (or `Drains: <review id>` for a body-only finding), so the collector neither re-fixes nor replies early (`references/answering-findings.md`). An issue the collector opens — commits parked on `ai/held/*`, or a window's deferred findings — is the session's to answer like any other, and so is a red collector run (`references/held-commits.md`).

## After a release merges

Nothing is owed by the session; a red `main` is the collector's repair, and a merge that got into the queue is undone by a force-rebase (`references/after-a-release.md`).

## Deep Dives

- `references/pull-conflicts.md` — when `git pull --rebase` stops on a conflict.
- `references/answering-findings.md` — when the session fixes a CodeRabbit finding itself.
- `references/held-commits.md` — when the collector opens an issue for parked commits, deferred findings or a red `main` past its repairs, or a collector run is red.
- `references/after-a-release.md` — when a release has merged, `main` is red, or a merge got into the queue.
- `references/running-by-hand.md` — when the collector's workflow is off, the cycle is run from a checkout, or a change to the collector is about to land.
