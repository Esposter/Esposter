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
gh api "repos/Esposter/Esposter/issues/<pr>/comments?per_page=100" --paginate \
  --jq '.[] | select(.user.login=="coderabbitai[bot]") | .body'
```

The walkthrough issue-comment is **edited in place** across reviews, so its `created_at` stays pinned to the first review while `updated_at` moves. Filtering issue comments by `created_at` hides the current walkthrough — sort by `updated_at`.

## Replying to a review comment

```bash
gh api "repos/Esposter/Esposter/pulls/<pr>/comments/<comment_id>/replies" -f body="..."
```
