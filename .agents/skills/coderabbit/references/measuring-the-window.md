# Measuring the Window

Read before a push: what is already unreviewed, what the push would add, and whether the frontier really stalled.

## Never `gh pr view --json changedFiles`

It is the command that comes to hand, it answers instantly, and on a long-lived PR it is wrong by a multiple: it counts the **cumulative** diff against the base branch — every cycle the PR has ever had — while CodeRabbit reviews only what moved since its last completed one. On this repo's one standing `develop`→`main` PR it has read four times the real window, which turns a healthy push into a fabricated "over the cap, cut a queue branch" and stalls work for nothing. The same goes for the changed-files count in the PR's web UI, and for `gh pr diff --name-only`.

There is one exception, and it is the merge-base count at the bottom of this page: the **first** review of a PR, or a full re-review, does read the cumulative diff.

## Read the last reviewed sha, never infer it

Every review body states its own range, so this is a fact to read. One block, so no step gets substituted for a shortcut — it prints the frontier and both counts:

```bash
PR=<pr>; BRANCH=<branch>
LAST=$(gh api "repos/:owner/:repo/pulls/$PR/reviews?per_page=100" --paginate \
  --jq '[.[] | select(.user.login=="coderabbitai[bot]") | select((.body|length) > 0)
        | .body | capture("between [0-9a-f]{40} and (?<b>[0-9a-f]{40})") | .b] | last')
echo "last reviewed:     $LAST"
echo "pushed+unreviewed: $(git diff --name-only "$LAST"..origin/$BRANCH | wc -l)"
echo "next push adds to: $(git diff --name-only "$LAST"..HEAD | wc -l)"
```

An empty `LAST` means no review body has ever named a range — that is the first-review case, and the merge-base count below is the one that applies. It never means zero.

## Take the second number before a push

The pipeline deliberately keeps local commits ahead of the reviewed frontier, so `..origin/<branch>` measures the pushed backlog only and omits exactly the commits the push is about to add — it can read comfortably under the cap while the push lands well over it. Use `..origin/<branch>` only to answer "is a previous window still unreviewed"; use `..HEAD` (or `..<cut-sha>` when holding a tail back) to size the window.

**The budget is measured from that sha, not from the last push**. An unreviewed window does not clear — it accumulates. Two pushes of 35 and 80 that each looked compliant are one 115-file window, over the cap, and the review is skipped outright rather than truncated.

## A rate-limited status does not prove the frontier stalled

CodeRabbit advances its incremental checkpoint over commits it never posted a review body for: the status still reads `Review rate limited`, no range names them, and they count as reviewed anyway. Reading that as an unreviewed window inflates the next backlog by everything it silently covered and stalls pushes to protect a review that will never run. The reviewed range is evidence the checkpoint moved, never evidence it did not. The probe is the retrigger itself — `@coderabbitai review` replies `Already reviewed` when the checkpoint covers the head, and starts a review when it does not. Read **the reply to the probe**, never whichever bot comment is newest (`review-feedback.md`); a decline costs nothing.

## Counting the files a window would carry

```bash
# Committed since branching, plus anything not yet committed — as a set, since a file can be in both.
{ git diff --name-only "$(git merge-base <base-branch> HEAD)"; git status --porcelain -uall | cut -c4-; } |
  sort -u | wc -l
```

Count the **union**, not the sum: a file with both committed and working-tree changes is one file to CodeRabbit, and summing it twice cuts the chunk early.

**Incremental reviews refresh the budget.** CodeRabbit reviews only the files changed since its last completed review, not the cumulative PR diff, so within one long-lived PR the budget applies **per cycle** — measure `<last-reviewed-sha>..HEAD`. The merge-base count above governs the **first** review of a PR and any full re-review.
