# Composing a push window

Read when a push would exceed the file cap, or when work authored last has to be reviewed first.

A window is a **prefix of the unpushed range**, so what rides in it is decided by commit order, not authoring order. Push a prefix and hold the rest by naming the cut sha:

```bash
git push origin <cut-sha>:<branch>      # everything after <cut-sha> stays local
```

## Reordering so a fix leads

Work authored last but wanted first — review fixes, a config change, anything gating the next cycle — is **prepended to the unpushed range** rather than left at the tip, where it would wait a whole cycle behind the queued chunk. Reordering unpushed commits is free; they exist nowhere else:

```bash
FIX=$(git rev-parse <fix-sha>)
OLD=$(git rev-parse HEAD)                             # the old tip, so the reset is recoverable
test -z "$(git status --porcelain -uall)" || exit 1   # a dirty tree loses work the reset cannot restore
git reset --hard origin/<branch>                      # the reviewed frontier
pick() {
  local commits
  commits=$(git rev-list "$1") || return 1   # an unresolvable range fails rather than listing nothing
  test -n "$commits" || return 0             # either range is empty when the fix was authored first or last
  git cherry-pick "$1"
}
git cherry-pick "$FIX"                    # the fix goes first
pick "origin/<branch>..$FIX^"             # the work it was authored on top of
pick "$FIX..$OLD"                         # anything after it
```

`pick` exists because `cherry-pick` errors on an empty commit set rather than skipping it, and because a range git cannot resolve also lists nothing — separating the two matters once the reset has already moved the tip, where treating an unresolvable range as empty would silently drop those commits.

Only reorder when the fix is **independent of the commits it jumps**. One that edits a file a jumped commit rewrote conflicts on replay, and resolving it means rewriting the fix against the older text — there it belongs where it was authored. Cherry-pick cannot replay a merge commit either: drop the merge from the range and redo it at the end.

## The cap is a gate on the push, not a target to recover from

Measure before every push and hold the overflow locally. A push that overshoots is not a setback costing one review cycle — it is one that can cost every cycle after it. The only way to shrink an over-budget branch is to rewind it, and a force-push desynchronises CodeRabbit's incremental checkpoint from the branch: after a rewind it can measure the next window from a sha whose files it has already reviewed, inflating the count well past the local one, and every later push inherits that baseline.

When a push has already overshot, the recovery is to shorten `develop`, park the remainder on a queue branch, and drain it one window at a time — `references/release-pr-cutting.md`. Last resort, with a real cost.

**Exclusions are rarely the answer, and never for a substantive file.** Over budget is a chunking problem: split the work, or land it in stages so each cycle stays under the cap. Excluding a file that carries real content buys a smaller review, not a better one — the diff still ships, just unread. When to reach for one anyway, and the procedure: `references/exclusions.md`.
