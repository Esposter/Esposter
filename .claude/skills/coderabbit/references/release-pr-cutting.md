# Cutting a release PR back to the review budget

Read when a push has put a review window past the file limit and CodeRabbit skips it outright ("Review skipped: N files exceed the limit of 100"). This is the recovery for **any** overshoot, not just a PR too big for its first review — an already-reviewed PR trips it the ordinary way, by accumulating past ~80 files locally between pushes.

The release PR (`develop` → `main`) can't be planned to a budget — it accumulates whatever merged. The fix is to **shorten `develop` and park the rest on a queue branch**, then feed the queue back one window at a time.

**Never force-push `develop` to make a window fit.** A rewind desynchronises CodeRabbit's incremental checkpoint from the branch, and the checkpoint does not recover on its own: the review after one such rewind anchored on the **start** of its own range rather than the end, so the next window was counted from a sha whose 65 files had already been reviewed and accepted, and a locally-measured 98-file window arrived as 153. Every later cycle inherits that inflated baseline. The cost of one rewind is therefore not one skipped review but a branch that cannot get under the cap again by any additive means.

This is what makes **step 1 below a last resort rather than the routine tool.** The routine tool is not pushing over the cap in the first place (SKILL.md § Pipelining): commit locally, measure, and push while the window is still small.

**Do not predict the baseline — read it.** The reliable number is the one in the bot's own skip comment ("This PR contains N files"), and that comment is **edited in place**, so its `created_at` is the first skip while its body is always the current count. Any local `git diff` is a lower bound, not the answer:

```bash
gh api repos/:owner/:repo/issues/<pr>/comments --paginate --jq '.[] | select(.user.login=="coderabbitai[bot]") |
  select(.body|test("Too many files")) | .updated_at + " " + (.body | capture("contains (?<c>[0-9]+) files").c)' | tail -1
```

When a local measure and that number disagree, the bot is right and the local baseline guess is wrong.

Never open side PRs against `main` to slice it up. Each one spends a review slot on arrival, and the release PR is not the thing that needs splitting — its _review cycles_ are.

**There are only ever two branches: `develop` and `queue/<scope>`. One PR: the release PR, which stays open the whole time.**

**The queue branch stages content, never history.** Port its changes onto `develop` as fresh commits and delete the branch — do not merge it. A merge replays the queue's original commits and adds a merge commit, which is exactly the shape that leaves CodeRabbit's checkpoint ambiguous; a linear, purely additive `develop` is what it tracks reliably. Porting does not change the file count — the same files change either way — so this buys history hygiene, not headroom.

## 1. Cut

Cut by commit window, not by file. The loop prints the cumulative file count at **every** commit in the range, because a topical cluster does not always land as a merge — the count jumps at the merges, each jump is one cluster, so prefer the merge boundary nearest the budget and fall back to a plain commit when none sits there:

```bash
for commit in $(git rev-list --reverse <base>..develop); do
  printf '%4d  %s\n' "$(git diff --name-only -M "<base>..$commit" | wc -l)" "$(git log -1 --oneline "$commit")"
done
```

**A prefix is coherent history but not necessarily a working tree — the cut has to land where CI is green.** Local commits are pushed in batches, so a commit that moves a module and the one that repoints its importers can be several apart; every commit between them typecheck-fails, and nothing complains until a cut stops there. The file count says nothing about this. Before settling on a boundary, check that the candidate builds — and if it doesn't, walk **forward** to the commit that repairs it rather than back, since the breakage is only fixed above:

```bash
git stash -u && git switch --detach <candidate> && (cd packages/app && pnpm typecheck)
```

A cut that lands mid-breakage is not a lost-work problem — the repair is safe on the queue branch — but it publishes a red `develop` and burns the review cycle on a window whose CI never passes.

Take the boundary nearest ~80 files. The next three commands discard and rewrite published history, so they are the one place in this repo that needs a gate first — **get explicit approval for this cut**, and check all three of: the worktree is clean (`git status --porcelain -uall` empty — a `reset --hard` eats uncommitted work), you are on `develop` and not a worktree branch, and the local tip matches `origin/develop` (`git rev-parse develop origin/develop`) so no other session's push is about to be overwritten. `--force-with-lease` refuses the push if the remote moved, but nothing catches a dirty tree or the wrong branch.

Then park and cut:

```bash
git branch queue/<scope> develop && git push origin queue/<scope>   # nothing lost yet
git reset --hard <cut> && git push --force-with-lease origin develop
```

**Reset straight to `<cut>` — the first window stays on `develop`.** Resetting all the way back to `<base>` and then merging the window in is the same end state by a worse route: it is two pushes, and the first reviews a zero-file diff, so it spends a review slot to say nothing. One push, one slot, one window.

The park has to be pushed **before** the reset, not after. Until `queue/<scope>` exists on the remote the cut commits live only in this clone, and a `reset --hard` that lands with the push unmade is unrecoverable from anywhere else.

Re-basing the park onto the cut is **only needed if you put something on `develop` after the reset** — the cherry-picks below are the usual reason. Otherwise it is a no-op: `queue/<scope>` was branched from the old tip, so once `develop` is `<cut>`, `develop..queue/<scope>` is already exactly the remainder. When you do need it:

```bash
git rebase --rebase-merges --onto develop <cut> queue/<scope> && git push --force-with-lease origin queue/<scope>
```

`--rebase-merges` because the cut lands on a merge boundary and the remainder above it normally holds several more — a plain `--onto` flattens them, taking with them the boundaries the next window is sized at.

Cherry-picked doc commits replay as no-ops, or conflict if reworded since — `git rebase --skip` those, `develop`'s version is newer. Read the commit's **patch**, `git show <commit>`, before skipping: `--skip` drops the whole commit rather than the conflicting hunk, so one that also carried unrelated work loses it, and `--stat` shows only which files it touched, not whether their content is the cherry-pick. Verify the same way before force-pushing the queue — `git diff <old-queue-head> queue/<scope>`, patch not `--stat`, should show only rewordings you recognise.

Cherry-pick doc and skill commits across the cut so the working tree keeps the conventions it is being asked to follow.

## 2. Drain

Port one queue window onto `develop`, trigger a review, wait for `Review completed`, fix findings, then port the next. Reviews are incremental — each cycle reads only what changed since the last completed one (SKILL.md § PR File Budget) — so every window gets a full-budget review even though the PR's cumulative diff grows past the cap.

Size each window off the queue the way the cut was sized, then **cherry-pick the window, never merge the branch.** `git merge queue/<scope>` takes the whole remainder and rebuilds the over-budget PR in a single push; even merging a single window commit adds a merge commit and replays the queue's shas, and `develop` is tracked most reliably when it only ever grows linearly:

```bash
for commit in $(git rev-list --reverse develop..queue/<scope>); do
  printf '%4d  %s\n' "$(git diff --name-only -M "develop..$commit" | wc -l)" "$(git log -1 --oneline "$commit")"
done
git switch develop && git cherry-pick <first-of-window>^..<window> && git push origin develop
git rev-list --count develop..queue/<scope>   # what the queue still owes
```

Cherry-picking leaves the queue's own commits behind, so `develop..queue/<scope>` no longer shrinks on its own — track what is left by what you have ported, and delete the branch once the last window is on `develop` rather than waiting for that count to reach `0`.

**Re-measure the window immediately before pushing, not when planning it.** The count that matters is the one after the review fixes, the merge and the format/lint pass have all landed, and it lands higher than the estimate: a lint pass fixes whatever the merged window dragged in, so it touches files no one attributed to the window. Planning at "89 plus the five files the findings name" is how a window arrives at the remote at 101.

```bash
git diff --name-only -M <last-reviewed-sha>..HEAD | wc -l   # after every commit, before the push
```

Over budget at that point is cheap to fix precisely because nothing is pushed: drop the tail commit back to the queue (`git reset --hard <fixes>`, re-merge the smaller window, cherry-pick the work that sat above it), and the queue simply owes one more commit. Prefer dropping a whole trailing commit to hunting individual files — the boundary stays a commit boundary, and the next window is already sized.

`--no-ff` rather than `--ff-only`: the fixes for one window's findings land on `develop`, so from the second window on the queue is no longer a descendant of `develop` and a fast-forward is refused. The queue branch itself is never moved — `develop..queue/<scope>` shrinks on its own as windows merge, and it is empty (count `0`) when the branch can be deleted.

## 3. Merge

Merge the release PR to `main` only when the queue is empty and every window came back clean.

Three things break the scheme:

- **Pushing before the running review reports `Review completed`** — it cancels that review and its findings do not come back.
- **Asking for a full re-review** — it re-reads the cumulative diff and trips the file limit again.
- **A force-push while a review is running** — the cut in step 1 retriggers the open PR's review like any other push, so check the state first and check no other session is pushing `develop`.

Counts don't subtract: a file touched in two windows counts in both, so the remainder is bigger than `total - prefix`. Measure it — `git diff --name-only -M develop..queue/<scope> | wc -l`.
