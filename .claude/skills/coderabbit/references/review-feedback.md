# Retrieving and answering CodeRabbit feedback

Read when pulling a PR's review feedback, counting what is still open, or replying to a comment. What the output means — where nitpicks live, reconciling against the stated counts, replying to every finding — is in `SKILL.md`; this page is the calls and the ways they lie.

## All three endpoints

CodeRabbit's feedback is split across **three different endpoints**. Reading only one silently loses findings, and the loss is invisible — nothing tells you a category was missed.

```bash
# 1. Review bodies -> "Actionable comments posted: N" + the collapsed NITPICK block.
#    Nitpicks live ONLY here. They are not inline comments.
gh api "repos/Esposter/Esposter/pulls/<pr>/reviews?per_page=100" --paginate \
  --jq '.[] | select(.user.login=="coderabbitai[bot]") | select(.body|length > 0) | .body'

# 2. Inline review comments -> the actionable, file-anchored findings.
gh api "repos/Esposter/Esposter/pulls/<pr>/comments?per_page=100" --paginate \
  --jq '.[] | "\(.id) \(.path):\(.line // .original_line)\n\(.body)\n"'

# 3. Issue comments -> the walkthrough, status, and rate-limit notices.
#    Sorted so the newest state is last; the endpoint ignores sort/direction, and --jq would sort
#    each page on its own, so --slurp hands every page to one process that sorts across all of them.
gh api "repos/Esposter/Esposter/issues/<pr>/comments?per_page=100" --paginate --slurp |
  node -e 'const pages = JSON.parse(require("fs").readFileSync(0, "utf8"));
    for (const { body } of pages.flat()
      .filter(({ user }) => user.login === "coderabbitai[bot]")
      .sort((a, b) => a.updated_at.localeCompare(b.updated_at))) console.log(body);'
```

The walkthrough issue-comment is **edited in place** across reviews, so its `created_at` stays pinned to the first review while `updated_at` moves. Filtering issue comments by `created_at` hides the current walkthrough — sort by `updated_at`, as the call above does.

**Anything that must see the whole result set goes downstream of `--paginate --slurp`, never in `--jq`.** `gh` runs `--jq` once per page, so a `sort_by`, a `.[-1]`, a `.[-N:]` or a `length` computed there describes one page rather than the PR — silently, and only once a PR passes 100 comments, which is exactly when the answer matters. Per-element work (`select`, string building) is unaffected and stays in `--jq`, which is why calls 1 and 2 above still use it.

`--slurp` emits an **array of pages**, hence the `.flat()`. It cannot be combined with `--jq` or `--template` (gh rejects the pair), so the aggregation runs in a second process — `node -e`, not `jq`, because the repo's toolchain guarantees node and this machine has no standalone `jq` on `PATH`.

## The login differs by API, and so does the shape

REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports `user.login` as **`coderabbitai[bot]`**; GraphQL (`reviewThreads`) reports `author.login` as **`coderabbitai`**, with the `[bot]` suffix stripped. Neither is "the" login — write the filter for the endpoint in hand:

```bash
# REST — the payload is a bare array, and the author sits on `user`
gh api "repos/:owner/:repo/pulls/<pr>/comments" --jq '.[] | select(.user.login == "coderabbitai[bot]")'
# GraphQL — the payload is an object, and the author sits on `author`, one `nodes[]` per connection
gh api graphql -f query='...' --jq '.data.repository.pullRequest.reviewThreads.nodes[]
  | select(.comments.nodes[0].author.login == "coderabbitai")'
```

A `.[]` against the GraphQL payload iterates the top-level object's values, so it neither errors nor matches.

**A `--jq` filter on the wrong login returns empty and exits 0.** Empty output from a filtered query means _"my filter was wrong"_ until proven otherwise — never "there are none". Prove it by re-running without the author filter: a non-zero unfiltered count means the filter was the bug. Do that before reporting zero, every time; a false zero reads exactly like a clean PR.

## Counting open findings

```bash
gh api graphql --paginate -f query='
query($endCursor: String) {
  repository(owner: "<owner>", name: "<repo>") {
    pullRequest(number: <pr>) {
      reviewThreads(first: 100, after: $endCursor) {
        pageInfo { hasNextPage endCursor }
        nodes { isResolved isOutdated path line comments(first: 1) { nodes { author { login } body } } }
      }
    }
  }
}' --jq '.data.repository.pullRequest.reviewThreads.nodes[]
  | select(.isResolved == false)
  | select(.comments.nodes[0].author.login == "coderabbitai") | .path' | wc -l
```

**`--paginate` and `pageInfo` are both load-bearing**, and the failure is silent in the direction that matters. A long-lived release PR accumulates threads for its whole life, so `reviewThreads(first: 100)` alone starts dropping the newest page exactly when the PR is busiest, and reports the backlog as drained. `gh` follows the cursor only when the query declares `$endCursor` and selects `pageInfo`; omit either and it returns page one and exits 0. Count with `| wc -l` over one line per thread rather than `| length`, which reports a per-page length once per page.

**The author filter is load-bearing in the other direction.** Unfiltered, the count is every unresolved thread on the PR — a human comment or another bot's thread then holds the drain gate shut against findings that were never CodeRabbit's, and the number stops reconciling against the review bodies' `Actionable comments posted: N`. Because the two mistakes are silent and point opposite ways, run it unfiltered too and read the gap as the human threads it is.

Unresolved threads are the inline half only — reconcile against the stated counts (`SKILL.md`), since nitpicks never exist as threads and inline comments can fail to post outright.

## Probing whether the checkpoint covers the head

Posting `@coderabbitai review` and reading straight back races the bot: the reply does not exist yet, so the read returns the previous bot comment — which is a real CodeRabbit remark and reads exactly like an answer. Wait for the newest bot comment to _change_, then read that one.

```bash
crLatest() {  # the bot's most recently touched issue comment: "<id> <updated_at>"
  gh api "repos/Esposter/Esposter/issues/<pr>/comments?per_page=100" --paginate --slurp |
    node -e 'const [comment] = JSON.parse(require("fs").readFileSync(0, "utf8")).flat()
      .filter(({ user }) => user.login === "coderabbitai[bot]")
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
      console.log(comment ? `${comment.id} ${comment.updated_at}` : "0 none");'
}

before=$(crLatest) || exit 1
gh pr comment <pr> --body "@coderabbitai review" || exit 1
deadline=$((SECONDS + 600))
while :; do
  test "$SECONDS" -lt "$deadline" || { echo "no reply in 10m — read the PR before assuming anything" >&2; exit 1; }
  latest=$(crLatest) || { sleep 10; continue; }   # a failed read is not a new checkpoint
  test "$latest" != "$before" && break
  sleep 10
done
echo "$latest"   # then read that comment's body: "Already reviewed" -> the checkpoint already covers the head
```

**Sort by `updated_at`, not by `id`.** The answer often arrives as an **in-place edit** of the walkthrough, which keeps its original id — so the newest id can be a comment that has not moved while the one that did sorts below it. `id` stays only as the tie-breaker for two comments written in the same second. For the same reason the compared value is `id` plus `updated_at` rather than the first body line: an edit that leaves the first line intact is invisible to a body comparison, and `updated_at` moves whatever the edit touched.

**The loop needs a deadline, and a failed read must not end it.** A bot that never posts and a failed API call look identical to an `until` loop, and both make it sleep forever. Bound it and fail loudly — an unanswered probe is a thing to go look at, not a thing to keep waiting on. Command substitution discards exit status, so a `crLatest` that errors returns an empty string, which differs from `$before` and reads as the reply arriving: capture the status separately and compare only a read that succeeded.

The `--slurp`-then-`node` aggregation is required for the same reason as above: a `last` inside `--jq` would describe one page.

## Replying to a review comment

```bash
gh api "repos/Esposter/Esposter/pulls/<pr>/comments/<comment_id>/replies" -f body="..."
```
