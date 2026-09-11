# Retrieving and answering CodeRabbit feedback

Read when pulling a PR's review feedback, counting what is still open, or replying to a comment. What the output means — where nitpicks live, reconciling against the stated counts, replying to every finding — is `references/answering-findings.md`; this page is the calls and the ways they lie.

## Three endpoints, and what each one alone loses

CodeRabbit's feedback is split across three endpoints, and reading one silently loses the others' findings —
nothing tells you a category was missed. `pnpm ai:coderabbit:feedback <pr>` reads all three; this is what they
are, for the ad-hoc question the script does not answer.

| Endpoint               | Carries                                                                          | Lost by skipping it                                                                               |
| :--------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `pulls/<pr>/reviews`   | `Actionable comments posted: N`, the nitpick block, the outside-diff-range block | Every bodied finding — neither bucket ever exists as an inline comment                            |
| `pulls/<pr>/comments`  | the file-anchored inline findings, and the comment id a reply needs              | The threads, and any way to answer one                                                            |
| `issues/<pr>/comments` | the walkthrough: Merge Risk, the pre-merge checks, rate-limit notices            | The verdict — it appears in no review body, so the other two reconcile perfectly while missing it |

A one-off read of one endpoint is a single command and stays one:

```bash
gh api "repos/{owner}/{repo}/pulls/<pr>/reviews?per_page=100" --paginate \
  --jq '.[] | select(.user.login=="coderabbitai[bot]") | select(.body|length > 0) | .body'
```

Two traps in writing another one. **`gh` runs `--jq` once per page**, so a `sort_by`, `.[-1]`, `.[-N:]` or
`length` computed there describes one page rather than the pull request — silently, and only once it passes a
hundred comments, which is exactly when the answer matters. Per-element work (`select`, string building) is
unaffected. And the **walkthrough is edited in place**, so its `created_at` stays pinned to the first review
while `updated_at` moves: sorting or filtering issue comments by `created_at` hides the current one.

## One call for every bodied finding

```bash
pnpm ai:coderabbit:feedback "<pr>"
```

It prints the newest review's stated `Actionable comments posted: N` and every findings bucket, then the
unresolved threads as `<comment id> <path>:<line>` with the first line of each finding, then the two counts
reconciled, then the walkthrough's **Merge Risk** verdict and **Pre-merge checks** table. One command, because
the content is split across two endpoints and a fetch of the reviews endpoint alone reads as complete while
missing the verdict entirely.

**What the output is not telling you** is the part worth knowing:

- **A findings bucket it prints that this page never names is still a finding.** The categories are not a fixed
  set — nitpicks and outside-diff-range findings are the two constants, and CodeRabbit invents further buckets
  (duplicates, refactor suggestions, an additional-comments block once a review carries many). The script
  suppresses known boilerplate and prints the rest, so an unseen bucket surfaces by default; grepping its output
  for a category name puts the loss back.
- **A thread count under the stated actionable count is reported, not hidden.** It means the findings were
  resolved already or the inline comments failed to post — the review says the latter in a `> [!CAUTION] Inline
review comments failed to post` block, and either way the body still lists them.
- **Nitpicks and outside-diff-range findings have no thread to resolve**, so nothing marks them done and no
  later review edits the body that lists them. Check each against the current file before acting: the counts
  reconcile the fetch, never the state of the code.
- **Merge Risk names the sha it covers** (`· up to \`61705\``). A High covering a sha two pushes back describes
  code the fixes already changed, which is how a drained pull request reads as blocked. Read the sha first; the
  rationale is usually that review's findings restated as consequences, which makes it the fastest confirmation
  that a window's fixes landed.

## The login differs by API, and so does the shape

REST (`/pulls/<pr>/comments`, `/reviews`, `/issues/<pr>/comments`) reports `user.login` as **`coderabbitai[bot]`**; GraphQL (`reviewThreads`) reports `author.login` as **`coderabbitai`**, with the `[bot]` suffix stripped. Neither is "the" login — write the filter for the endpoint in hand:

```bash
# REST — the payload is a bare array, and the author sits on `user`
gh api "repos/{owner}/{repo}/pulls/<pr>/comments" --jq '.[] | select(.user.login == "coderabbitai[bot]")'
# GraphQL — the payload is an object, and the author sits on `author`, one `nodes[]` per connection
gh api graphql -f query='...' --jq '.data.repository.pullRequest.reviewThreads.nodes[]
  | select(.comments.nodes[0].author.login == "coderabbitai")'
```

A `.[]` against the GraphQL payload iterates the top-level object's values, so it neither errors nor matches.

**A `--jq` filter on the wrong login returns empty and exits 0.** Empty output from a filtered query means _"my filter was wrong"_ until proven otherwise — never "there are none". Prove it by re-running without the author filter: a non-zero unfiltered count means the filter was the bug. Do that before reporting zero, every time; a false zero reads exactly like a clean PR.

## Counting open findings

`pnpm ai:coderabbit:feedback <pr>` prints them, and its count is the bot's unresolved threads alone. Two
things that count answers are worth separating:

- **It is the inline half only.** Neither nitpicks nor outside-diff-range findings ever exist as threads, and an
  inline comment can fail to post outright, so the stated counts in the review body are what the number
  reconciles against.
- **It excludes human threads on purpose.** Unfiltered, an unresolved thread from a person holds the drain gate
  shut against findings that were never CodeRabbit's, and the number stops reconciling against
  `Actionable comments posted: N`. When the pull request feels stuck with nothing open, read the threads
  unfiltered in the UI and the gap is the human ones.

## Probing whether the checkpoint covers the head

```bash
pnpm ai:coderabbit:probe "<pr>"
```

It posts `@coderabbitai review` and prints the reply — `Already reviewed` means the checkpoint already covers
the head, anything else means a review is starting. **It spends a slot when a review does start**, so it is
asked for like any other push-adjacent action.

Reading straight back instead races the bot: its reply does not exist yet, so the read returns the previous
comment — a real CodeRabbit remark that looks exactly like an answer. The script waits for the newest comment to
_change_, which is why the answer usually arrives as an **in-place edit** of the walkthrough: the edit keeps the
comment's id and can leave its first line intact, so only the timestamp moves. After ten minutes it fails rather
than waiting, because an unanswered probe is something to go and look at.

## Replying to a review comment

```bash
gh api "repos/Esposter/Esposter/pulls/<pr>/comments/<comment_id>/replies" -f body="..."
```
