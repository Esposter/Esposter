---
name: review-queue
description: Apply when about to git commit or git push, when deciding what branch a commit lands on, when a pull stops on a rebase conflict, when a review run is red, or when a CI run on ai/queue or main is red. Esposter's review queue — the agent's side of the review: one permanent branch ai/queue that every session and Renovate push to, every change committed on `ai/queue` itself in the main checkout (no branch of its own), and a worktree opened only for changes that run concurrently, landed by git pull --rebase then git push, a rebase conflict settled by the agent that made the commit, and main moved only by the review.
---

# Review Queue

Every agent works on **one permanent branch, `ai/queue`**, from its own git worktree, and lands its commits on it with `git pull --rebase` and `git push`. Nothing rewrites `ai/queue`. The review (`apps/web/content/docs/infra/review.md`, its workflow `.github/workflows/Review.yaml`) plans every window of the commits `main` does not yet have, reviews all of them in one pool, and moves `main` forward only through the windows that passed. This skill is what an agent does on its side of that.

## Settled — do not re-propose

- **Per-chunk feature branches.** The queue is linear history and the review cuts its windows at commit boundaries, so a branch per chunk adds a merge that buys nothing.
- **Pushing `main` by hand, outside the scenarios below.** `main` moves by the review's fast-forward. Two hand pushes are allowed, both plain fast-forwards, never forced: the owner's fast-forward of `main` to `ai/queue` once a review has passed, and the direct local push below. The owner's fast-forward is the session's to run when the owner says **sync to main**: that phrase is the whole instruction, so the session reviews `main..ai/queue` locally (the `code-review` skill, both lanes, every commit in the window), and once the review passes it pushes `main` as a plain fast-forward and syncs the local `main` to it. Each finding is fixed directly, in its own commit on `ai/queue`, with no approval asked; the sync then goes ahead on the fixed tip. Any other hand push is a commit the review never read.
  - **Direct local push (no review), two commit types only.** A commit whose subject is `fix(ci):` (a CI fix) or `chore(deps):` (a hand dependency update, `dependency-updates`), made locally in the main checkout. It goes to `ai/queue` and then `main` in the same sitting, without waiting for the review. The push does not wait on its CI run. A red result is fixed in the next commit, pushed to both branches the same way.
  - **Never direct, whatever its size:** a docs page, a skill, a ledger, a roadmap entry, a feature, a refactor, a test. Those go to `ai/queue` and wait for the review, even when the change is one line of prose. A commit that touches docs alongside a CI fix is split, the fix going direct and the docs through the queue.
  - **When in doubt, the queue.** If the subject cannot honestly say `fix(ci)` or `chore(deps)`, the commit is not direct.
  - **Automatic, not a session's push.** Renovate's minor and patch automerges land on `ai/queue` by the bot, which is the one other separate change that does not need a session. Majors and pnpm bumps wait for a person, per the `dependency-updates` skill.
- **Merging `main` into `ai/queue`.** A merge is never linearised away, and it blinds the next pull: a rebase onto `origin/main` is then a no-op, and `git cherry` reads every already-landed commit as owed. The queue catches up by `git pull --rebase` only. The one merge the system makes itself is the review's, when `main` was pushed by hand.
- **Rebasing or force-pushing `ai/queue` to reshape it.** Nothing rewrites the queue, so a session that does is the only writer changing history under the others. A session's own unlanded commits are replayed by `git pull --rebase`, and that is all.
- **Syncing by reset.** `git reset --hard origin/ai/queue`, and a reset followed by cherry-picking what `git cherry` calls owed, stay rejected. `git cherry` matches patch ids, so the list cannot tell a commit the remote already carries from one it lacks, and the reset throws local history away on that guess. The rebase keeps it: each conflict stops on one commit with both sides in view.
- **A worktree created detached** (`git worktree add --detach`). A detached worktree has no fork point, so its pull replays every commit the queue holds that its `HEAD` reaches (`references/pull-conflicts.md`).
- **Holding a finished chunk until CI comes back.** A queue push spends nothing, and a red typecheck or lint found afterwards is one more commit behind the unit. Push each unit as it lands, and fix a red on `ai/queue` in the next commit (the `running-checks` skill).
- **Holding a commit for the review.** The review never waits on CI and reads every commit it is owed, whatever its size or shape. A session does not measure a window, exclude files to bring one under a cap, or open a pull request for one.
- **The review's local fallback.** When the workflow review cannot run (a usage limit, or CI unusable), the owner runs the same review locally from a separate Claude account, over the same window of commits `main` does not yet have. A passed window reaches `main` by the owner's fast-forward, as line 13 allows. A session runs the local review as its own pass only when the owner says **sync to main**, and then fast-forwards `main` itself once it passes (line 13); without that phrase it never lands on `main`.

## The refs

| Ref          | Written by                              | How                                                                          |
| :----------- | :-------------------------------------- | :--------------------------------------------------------------------------- |
| `ai/queue`   | every session, and Renovate's automerge | a plain push, after `git pull --rebase`; never force-pushed, never rewritten |
| `main`       | the review only                         | a fast-forward to the end of the last window that passed                     |
| other `ai/*` | the one session that owns it            | a plain push                                                                 |

A session pushes `main` only as the direct local push under "Settled" allows — never otherwise. Its branch is local, named after the change, and never pushed under its own name: it only gives the pull a fork point.

## The loop

Every change lands on `ai/queue` itself, in the main checkout: fast-forward `ai/queue` to `origin/ai/queue`, edit, commit by pathspec, and land. No branch is cut for a change, and a finished one is never left behind as a local branch. The checkout's existing installs serve it, so no install is run. A worktree is opened only when two or more changes must run at once, since each worktree costs a whole install of the packages it touches (`.agents/skills/throughput/references/fleet.md` owns the commands and why). Each agent:

1. **Fast-forwards `ai/queue` and works on it.** `git switch ai/queue && git merge --ff-only origin/ai/queue`. Only for a concurrent change: `git worktree add .agents/worktrees/<name> origin/ai/queue`, then the install of the packages it will touch, never the whole workspace. A failing `nuxt prepare` postinstall does not stop the agent: the packages still link, and the app's prepare is only the app's concern.
2. **Commits each coherent unit by pathspec.** The touched tests run once after the sitting's last edit, in the background (the `running-checks` skill), and what they call for is its own commit behind the unit.
3. **Lands the commits:**

```bash
for attempt in 1 2 3 4; do git pull --rebase origin ai/queue || break; git push origin HEAD:ai/queue && break; done
```

A rebase conflict stops the loop on the commit it stopped on, and the agent that made the commit settles it (`references/pull-conflicts.md`). Only a rejected push retries.

4. **Removes the branch, or the worktree, once its commits have landed.** A worktree goes through `.agents/skills/throughput/scripts/remove-worktree.sh`, which deletes its branch with it; a local branch is deleted with `git branch -d`.

**Worktrees live under `.agents/worktrees/`, which is gitignored. Windows needs long paths enabled once (see `apps/web/content/docs/architecture/monorepo-tooling.md`, Windows long paths).**

**Never `reset` or cherry-pick in the main checkout.** A single change may commit there on its local branch; a concurrent change goes in a worktree instead.

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
