# Measuring the Window

Read before a push: what is already unreviewed, what the push would add, and whether the frontier really stalled.

## Never `gh pr view --json changedFiles`

It is the command that comes to hand, it answers instantly, and on a long-lived PR it is wrong by a multiple: it counts the **cumulative** diff against the base branch — every cycle the PR has ever had — while CodeRabbit reviews only what moved since its last completed one. On this repo's one standing `develop`→`main` PR it has read four times the real window, which turns a healthy push into a fabricated "over the cap, cut a queue branch" and stalls work for nothing. The same goes for the changed-files count in the PR's web UI, and for `gh pr diff --name-only`.

There is one exception, and it is the merge-base count at the bottom of this page: the **first** review of a PR, or a full re-review, does read the cumulative diff.

## Read the last reviewed sha, never infer it

Every review body states its own range, so the frontier is a fact to read rather than a thing to estimate:

```bash
pnpm ai:coderabbit:window "<pr>"
```

```text
last reviewed:     ef66127af1b030d53b91c3112789e5646b999380
pushed+unreviewed: 5
next push adds to: 22
```

The head and base branches come from the pull request itself, so nothing has to be passed or remembered. When
no review body names a range the script says so and substitutes the merge base: that is the **first-review**
case, whose window is the cumulative diff this page's last section describes. It never means zero — reading it
as zero is how an over-cap first window gets pushed as a small one.

## Take the second number before a push

The pipeline deliberately keeps local commits ahead of the reviewed frontier, so `pushed+unreviewed` omits exactly the commits the push is about to add — it can read comfortably under the cap while the push lands well over it. It answers "is a previous window still unreviewed" and nothing else; `next push adds to` is the one that sizes the window. When a tail is being held back, the cut sha's own count is a `git diff --name-only <frontier>..<cut-sha>` away.

**The budget is measured from that sha, not from the last push**. An unreviewed window does not clear — it accumulates. Two pushes of 35 and 80 that each looked compliant are one 115-file window, over the cap, and the review is skipped outright rather than truncated.

## A rate-limited status does not prove the frontier stalled

CodeRabbit advances its incremental checkpoint over commits it never posted a review body for: the status still reads `Review rate limited`, no range names them, and they count as reviewed anyway. Reading that as an unreviewed window inflates the next backlog by everything it silently covered and stalls pushes to protect a review that will never run. The reviewed range is evidence the checkpoint moved, never evidence it did not. The probe is the retrigger itself: `pnpm ai:coderabbit:probe <pr>` replies `Review rate limited` when the bot ran nothing, and `Review finished` when it started the review that was owed (`references/review-feedback.md`). A decline costs nothing; a start costs the slot, which is why it is asked for. Before spending one, read the walkthrough: when the bot last skipped a review it stated `Next included review available in N minutes` there, counted from that comment's own timestamp, and a probe posted before that has already been answered.

## Counting the files a window would carry

```bash
# Committed since branching, plus anything not yet committed — as a set, since a file can be in both.
{ git diff --name-only "$(git merge-base <base-branch> HEAD)"; git status --porcelain -uall | cut -c4-; } |
  sort -u | wc -l
```

Count the **union**, not the sum: a file with both committed and working-tree changes is one file to CodeRabbit, and summing it twice cuts the chunk early.

**Incremental reviews refresh the budget.** CodeRabbit reviews only the files changed since its last completed review, not the cumulative PR diff, so within one long-lived PR the budget applies **per cycle** — measure `<last-reviewed-sha>..HEAD`. The merge-base count above governs the **first** review of a PR and any full re-review.
