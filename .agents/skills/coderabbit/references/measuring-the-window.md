# Measuring the Window

Read before a push: what is already unreviewed, what the push would add, and whether the frontier really stalled.

## Read the last reviewed sha, never infer it

Every review body states its own range, so this is a fact to read:

```bash
gh api "repos/:owner/:repo/pulls/<pr>/reviews?per_page=100" --paginate \
  --jq '.[] | select(.user.login=="coderabbitai[bot]") | select((.body|length) > 0)
        | "\(.submitted_at)  \(.body | capture("between (?<a>[0-9a-f]{40}) and (?<b>[0-9a-f]{40})") | "\(.a[0:9])..\(.b[0:9])")"' | tail -3
git diff --name-only <last-reviewed-sha>..origin/<branch> | wc -l   # already pushed and unreviewed
git diff --name-only <last-reviewed-sha>..HEAD | wc -l              # what the next push would add
```

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
