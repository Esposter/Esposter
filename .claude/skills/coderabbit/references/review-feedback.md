# Retrieving and answering CodeRabbit feedback

Read when pulling a PR's review feedback or replying to a comment. The rules about what the output means — nitpick location, the `coderabbitai[bot]` login, reconciling against the stated counts, replying to every finding — are in `SKILL.md`; this page is the calls.

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

## Probing whether the checkpoint covers the head

Posting `@coderabbitai review` and reading straight back races the bot: the reply does not exist yet, so the read returns the previous bot comment — which is a real CodeRabbit remark and reads exactly like an answer. Wait for the newest bot comment to _change_, then read that one.

```bash
crLatest() {  # the bot's newest issue comment: "<id> <first line>"
  gh api "repos/Esposter/Esposter/issues/<pr>/comments?per_page=100" --paginate --slurp |
    node -e 'const [comment] = JSON.parse(require("fs").readFileSync(0, "utf8")).flat()
      .filter(({ user }) => user.login === "coderabbitai[bot]")
      .sort((a, b) => b.id - a.id);
      console.log(comment ? `${comment.id} ${comment.body.split("\n")[0]}` : "0 none");'
}

before=$(crLatest)
gh pr comment <pr> --body "@coderabbitai review"
until [ "$(crLatest)" != "$before" ]; do sleep 10; done
crLatest   # "Already reviewed" -> the checkpoint already covers the head
```

Comparing the whole `"<id> <first line>"` line rather than the id alone also catches the walkthrough being **edited in place** into the answer. The `--slurp`-then-`node` aggregation is required for the same reason as above: a `last` inside `--jq` would describe one page.

## Replying to a review comment

```bash
gh api "repos/Esposter/Esposter/pulls/<pr>/comments/<comment_id>/replies" -f body="..."
```
