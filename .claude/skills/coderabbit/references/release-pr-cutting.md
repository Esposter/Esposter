# Cutting a release PR back to the review budget

Read when a PR has grown past the file limit and CodeRabbit skips it outright ("Review skipped: N files exceed the limit of 100").

The release PR (`develop` → `main`) can't be planned to a budget — it accumulates whatever merged. The fix is to **shorten `develop` and park the rest on a queue branch**, then feed the queue back one window at a time.

Never open side PRs against `main` to slice it up. Each one spends a review slot on arrival, and the release PR is not the thing that needs splitting — its _review cycles_ are.

**There are only ever two branches: `develop` and `queue/<scope>`. One PR: the release PR, which stays open the whole time.**

## 1. Cut

Cut by commit window, not by file, at a merge boundary — the cumulative count jumps there, each jump is one topical cluster, and any prefix is coherent history by construction:

```bash
for commit in $(git rev-list --reverse <base>..develop); do
  printf '%4d  %s\n' "$(git diff --name-only -M "<base>..$commit" | wc -l)" "$(git log -1 --oneline "$commit")"
done
```

Take the boundary nearest ~80 files. The next three commands discard and rewrite published history, so they are the one place in this repo that needs a gate first — **get explicit approval for this cut**, and check all three of: the worktree is clean (`git status --porcelain -uall` empty — a `reset --hard` eats uncommitted work), you are on `develop` and not a worktree branch, and the local tip matches `origin/develop` (`git rev-parse develop origin/develop`) so no other session's push is about to be overwritten. `--force-with-lease` refuses the push if the remote moved, but nothing catches a dirty tree or the wrong branch.

Then park, cut, and re-base the park onto the cut:

```bash
git branch queue/<scope> develop && git push origin queue/<scope>   # nothing lost yet
git reset --hard <cut> && git push --force-with-lease origin develop
git rebase --rebase-merges --onto develop <cut> queue/<scope> && git push --force-with-lease origin queue/<scope>
```

The rebase is what makes it two branches instead of three: without it the queue is a copy of `develop` plus the remainder. `--rebase-merges` because the cut lands on a merge boundary and the remainder above it normally holds several more — a plain `--onto` flattens them, taking with them the boundaries the next window is sized at.

Cherry-picked doc commits replay as no-ops, or conflict if reworded since — `git rebase --skip` those, `develop`'s version is newer. Read the commit's **patch**, `git show <commit>`, before skipping: `--skip` drops the whole commit rather than the conflicting hunk, so one that also carried unrelated work loses it, and `--stat` shows only which files it touched, not whether their content is the cherry-pick. Verify the same way before force-pushing the queue — `git diff <old-queue-head> queue/<scope>`, patch not `--stat`, should show only rewordings you recognise.

Cherry-pick doc and skill commits across the cut so the working tree keeps the conventions it is being asked to follow.

## 2. Drain

Merge one queue window into `develop`, trigger a review, wait for `Review completed`, fix findings, then merge the next. Reviews are incremental — each cycle reads only what changed since the last completed one (SKILL.md § PR File Budget) — so every window gets a full-budget review even though the PR's cumulative diff grows past the cap.

## 3. Merge

Merge the release PR to `main` only when the queue is empty and every window came back clean.

Three things break the scheme:

- **Pushing before the running review reports `Review completed`** — it cancels that review and its findings do not come back.
- **Asking for a full re-review** — it re-reads the cumulative diff and trips the file limit again.
- **A force-push while a review is running** — the cut in step 1 retriggers the open PR's review like any other push, so check the state first and check no other session is pushing `develop`.

Counts don't subtract: a file touched in two windows counts in both, so the remainder is bigger than `total - prefix`. Measure it — `git diff --name-only -M develop..queue/<scope> | wc -l`.
