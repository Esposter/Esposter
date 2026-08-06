# Cutting a release PR back to the review budget

Read when a PR has grown past the file limit and CodeRabbit skips it outright ("Review skipped: N files exceed the limit of 100").

The release PR (`develop` → `main`) can't be planned to a budget — it accumulates whatever merged. The fix is to **shorten `develop` and park the rest on a queue branch**, then feed the queue back one window at a time.

Never open side PRs against `main` to slice it up. Each one spends a review slot on arrival, and the release PR is not the thing that needs splitting — its _review cycles_ are.

**There are only ever two branches: `develop` and `queue/<scope>`. One PR: the release PR, which stays open the whole time.**

## 1. Cut

Cut by commit window, not by file. The loop prints the cumulative file count at **every** commit in the range, because a topical cluster does not always land as a merge — the count jumps at the merges, each jump is one cluster, so prefer the merge boundary nearest the budget and fall back to a plain commit when none sits there. Any prefix is coherent history by construction, so either is a valid cut:

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

Size each window off the queue the way the cut was sized, and **merge the window commit, never the branch** — `git merge queue/<scope>` takes the whole remainder and rebuilds the over-budget PR in a single push:

```bash
for commit in $(git rev-list --reverse develop..queue/<scope>); do
  printf '%4d  %s\n' "$(git diff --name-only -M "develop..$commit" | wc -l)" "$(git log -1 --oneline "$commit")"
done
git switch develop && git merge --no-ff <window> && git push origin develop
git rev-list --count develop..queue/<scope>   # what the queue still owes
```

`--no-ff` rather than `--ff-only`: the fixes for one window's findings land on `develop`, so from the second window on the queue is no longer a descendant of `develop` and a fast-forward is refused. The queue branch itself is never moved — `develop..queue/<scope>` shrinks on its own as windows merge, and it is empty (count `0`) when the branch can be deleted.

## 3. Merge

Merge the release PR to `main` only when the queue is empty and every window came back clean.

Three things break the scheme:

- **Pushing before the running review reports `Review completed`** — it cancels that review and its findings do not come back.
- **Asking for a full re-review** — it re-reads the cumulative diff and trips the file limit again.
- **A force-push while a review is running** — the cut in step 1 retriggers the open PR's review like any other push, so check the state first and check no other session is pushing `develop`.

Counts don't subtract: a file touched in two windows counts in both, so the remainder is bigger than `total - prefix`. Measure it — `git diff --name-only -M develop..queue/<scope> | wc -l`.
