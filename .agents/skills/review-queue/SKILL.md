---
name: review-queue
description: Apply when about to git commit or git push, when deciding what branch a commit lands on, when a pull stops on a rebase conflict, when a review run is red, or when a CI run on ai/queue or main is red. Esposter's review queue — the agent's side of the review: one permanent branch ai/queue that every session and Renovate push to, each agent's commits made in its own worktree and landed by git pull --rebase then git push, a rebase conflict settled by the agent that made the commit, and main moved only by the review.
---

# Review Queue

Every agent works on **one permanent branch, `ai/queue`**, from its own git worktree, and lands its commits on it with `git pull --rebase` and `git push`. Nothing rewrites `ai/queue`. The review (`apps/web/content/docs/infra/review.md`, its workflow `.github/workflows/Review.yaml`) plans every window of the commits `main` does not yet have, reviews all of them in one pool, and moves `main` forward only through the windows that passed. This skill is what an agent does on its side of that.

## Settled — do not re-propose

- **Per-chunk feature branches.** The queue is linear history and the review cuts its windows at commit boundaries, so a branch per chunk adds a merge that buys nothing.
- **Pushing `main` by hand.** `main` moves only by the review's fast-forward. A hand push is a commit the review never read.
- **Merging `main` into `ai/queue`.** A merge is never linearised away, and it blinds the next pull: a rebase onto `origin/main` is then a no-op, and `git cherry` reads every already-landed commit as owed. The queue catches up by `git pull --rebase` only. The one merge the system makes itself is the review's, when `main` was pushed by hand.
- **Rebasing or force-pushing `ai/queue` to reshape it.** Nothing rewrites the queue, so a session that does is the only writer changing history under the others. A session's own unlanded commits are replayed by `git pull --rebase`, and that is all.
- **Syncing by reset.** `git reset --hard origin/ai/queue`, and a reset followed by cherry-picking what `git cherry` calls owed, stay rejected. `git cherry` matches patch ids, so the list cannot tell a commit the remote already carries from one it lacks, and the reset throws local history away on that guess. The rebase keeps it: each conflict stops on one commit with both sides in view.
- **A worktree created detached** (`git worktree add --detach`). A detached worktree has no fork point, so its pull replays every commit the queue holds that its `HEAD` reaches (`references/pull-conflicts.md`).
- **Holding a finished chunk until CI comes back.** A queue push spends nothing, and a red typecheck or lint found afterwards is one more commit behind the unit. Push each unit as it lands, and fix a red on `ai/queue` in the next commit (the `running-checks` skill).
- **Holding a commit for the review.** The review never waits on CI and reads every commit it is owed, whatever its size or shape. A session does not measure a window, exclude files to bring one under a cap, or open a pull request for one.

## The refs

| Ref          | Written by                              | How                                                                          |
| :----------- | :-------------------------------------- | :--------------------------------------------------------------------------- |
| `ai/queue`   | every session, and Renovate's automerge | a plain push, after `git pull --rebase`; never force-pushed, never rewritten |
| `main`       | the review only                         | a fast-forward to the end of the last window that passed                     |
| other `ai/*` | the one session that owns it            | a plain push                                                                 |

A session never pushes `main`. Its branch in its own worktree is local, named after the worktree, and never pushed under its own name: it only gives the pull a fork point.

## The loop

An agent's commits never go through the main checkout. Each agent:

1. **Sets up a worktree on a branch of its own, cut from the queue.** `git worktree add -b <name> ~/Esposter/wt/<name> origin/ai/queue`. Then in it the agent installs and builds only the packages it will touch, never the whole workspace (`.agents/skills/throughput/references/fleet.md` owns the commands and why). A failing `nuxt prepare` postinstall does not stop the agent: the packages still link, and the app's prepare is only the app's concern.
2. **Commits each coherent unit in the worktree, by pathspec.** The touched tests run once after the sitting's last edit, in the background (the `running-checks` skill), and what they call for is its own commit behind the unit.
3. **Lands the commits:**

```bash
for attempt in 1 2 3 4; do git pull --rebase origin ai/queue || break; git push origin HEAD:ai/queue && break; done
```

A rebase conflict stops the loop on the commit it stopped on, and the agent that made the commit settles it (`references/pull-conflicts.md`). Only a rejected push retries.

4. **Removes the worktree** once its commits have landed: `.agents/skills/throughput/scripts/remove-worktree.sh`, which deletes its branch with it.

**Worktrees live on the drive of the pnpm store.** `~/Esposter` is on that drive, so pnpm hard-links from the store instead of copying.

**The main checkout is not edited by agents.** It only fast-forwards with `git pull --rebase`. Never `reset`, cherry-pick or stash in it.

**Never `git stash`, `git add -A`, or a bare `--force-with-lease`.** Commits are pushed plain, and every commit is reviewed, so no commit needs a marker to be treated differently. A commit may take any shape.

## Conflicts

A rebase conflict is always one of the agent's own commits meeting what `ai/queue` gained since: another agent's commit or Renovate's. The agent that made the commit settles it, since it knows its change. The rules are in `references/pull-conflicts.md`: keep both sides merged by hand, never take one side whole, then `git rebase --continue` and push.

## CI on the queue and on main

Whoever pushed a red typecheck or lint fixes it: reproduce it with that one check and push the fix behind it. The review never waits on CI, and `main` is never repaired in place (`apps/web/content/docs/infra/review.md`, "CI on the queue").

## Review issues

The review opens an issue labelled `review` for each finding it owes, and the review's settle job closes it once every finding is fixed, refuted or recorded (`apps/web/content/docs/infra/review.md`). A session never takes a `review` issue, and triage never applies or removes its label: it is the review's own. A session's commit that settles one of its findings does not close the issue, so no commit carries a `Closes #<number>` for it.

A review run that goes red is a session's to read. Its step summary names the window, the issue or the settler that failed, and the next commit fixes it (`apps/web/content/docs/architecture/engineering-loops.md`, "What runs next", item 2).

## Deep Dives

- `references/pull-conflicts.md` — when `git pull --rebase` stops on a conflict, or replays commits that are not the agent's.
- `references/local-settle.md` — when settling open review issues from a session, not the review's settle job.
