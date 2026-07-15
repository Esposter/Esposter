---
name: coderabbit
description: Esposter CodeRabbit review conventions — retrieving review feedback across all three endpoints (nitpicks live in the review body, not inline comments; the bot login is coderabbitai[bot]), replying to findings, checking review state before pushing (never push into a running review), .coderabbit.yaml is read from the PR base branch (normally develop), per-file path_filters for mechanical renames, and the standardized exclude/re-enable commit pair. Apply when fetching, addressing, or replying to CodeRabbit comments or nitpicks, before any git push to a branch with an open PR, when a PR is too large for review, when excluding files from CodeRabbit, or when the user says "remove the exclusions".
---

# CodeRabbit Conventions

## Config Is Read From the PR Base Branch

`.coderabbit.yaml` sits at the repo root. CodeRabbit reads it from the **base branch** of a PR, not the head branch. **PRs target `develop`, so `develop` is the branch that matters** — an exclusion only takes effect once it is on the branch the PR is based against.

Commit exclusions **directly to the base branch (`develop`)** as a standalone commit, separate from the work they cover. An exclusion committed on the feature branch does nothing.

The two branches diverge and that is expected: `develop` carries the live temporary exclusion block, `main` carries only the permanent entries (it picks up the block on release merges and loses it when the block is removed). Always check the branch you are actually on:

```bash
git show develop:.coderabbit.yaml | head -20   # the config CodeRabbit actually applies to PRs
```

## Why Per-File, Not Globs

CodeRabbit's `path_filters` are static globs with no notion of "this file was only renamed". A glob like `!packages/app/app/services/resource/sheet/**` excludes that tree for **every future PR**, permanently blinding review of real changes until someone remembers to revert it.

List every excluded file explicitly instead. It is verbose, and that verbosity is the point — a several-hundred-line block (the live File → Sheet block is ~732 entries) is obviously temporary and obviously scoped, where a 3-line glob quietly rots.

Keep permanent structural entries (`!pnpm-lock.yaml`, generated migrations) at the top of `path_filters`, above any temporary block.

## Never Push Into an In-Flight Review

**Check CodeRabbit's state before every push to a branch with an open PR.** Pushing while a review is running cancels it and retriggers a fresh one, which costs a rate-limit slot and loses the in-progress review's findings. CodeRabbit is an **incremental** system — it does not re-review commits it has already reviewed — so a cancelled review's comments do not reliably come back on the next run. They are simply gone.

The check run exposes the state directly:

```bash
gh pr checks --json name,state,description --jq '.[] | select(.name=="CodeRabbit")'
# {"description":"Review completed","name":"CodeRabbit","state":"SUCCESS"}
```

Push only on `SUCCESS` / `Review completed`. Anything else (`PENDING`, a review-in-progress description) means **wait** — poll until it settles, then push. If there is no open PR for the branch yet, there is no review to interrupt; push freely.

This applies per push, not per work session — a second push minutes after the first will land while the first push's review is still running. Batch commits and push once when the work is coherent, rather than pushing each commit as it lands.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from `coderabbitai[bot]`, or a review that silently returns far fewer comments than the diff warrants.

## Retrieving Review Feedback — All Three Places

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

**The bot's login is `coderabbitai[bot]`, not `coderabbitai`.** A `--jq` filter on the wrong login returns empty and exits 0. Empty output from a filtered query means _"my filter was wrong"_ until proven otherwise — never read it as "there are none".

**Reconcile before concluding.** Each review body opens with `Actionable comments posted: N` and its nitpick block is headed `🧹 Nitpick comments (M)`. Both counts are ground truth: if you have fewer than N inline comments or fewer than M nitpicks in hand, you are missing some — go find them rather than reporting what you happened to fetch.

Note the walkthrough issue-comment is **edited in place** across reviews, so its `created_at` stays pinned to the first review while `updated_at` moves. Filtering issue comments by `created_at` hides the current walkthrough. Sort by `updated_at`.

## Replying to Review Comments

```bash
gh api "repos/Esposter/Esposter/pulls/<pr>/comments/<comment_id>/replies" -f body="..."
```

Reply to every finding, including rejected ones — a silent skip is indistinguishable from an oversight. State the verdict in the first line (`Agreed, fixed in <sha>` / `Not a real issue, no change`) and give the evidence, since these threads are the record of why the code looks the way it does.

Verify before accepting. CodeRabbit reasons from names and prior "learnings" and will confidently assert semantics the code does not have — check the implementation, and when it flags a pattern, grep for the repo's existing convention rather than taking the suggested diff. If a finding is real, also check whether its twin exists elsewhere; the scan is per-file and routinely stops one file short.

## PR File Budget

CodeRabbit's free tier has a hard cap of ~150 files per PR. Keep every chunk of work to **~100 changed files measured from the branch point** — work is committed and pushed continuously, so dirty-file counts see nothing:

```bash
git diff --name-only "$(git merge-base <base-branch> HEAD)" | wc -l   # committed changes since branching (base is what this branch was cut from, e.g. develop)
git status --porcelain -uall | wc -l                                  # plus anything not yet committed
```

Run both and sum before starting a sweep. When the budget is reached, stop and hand back for a PR.

The budget is a **target to fill, not only a cap**. A single roadmap item is typically 8–15 files, so one-item-per-PR wastes most of a review slot and multiplies review rounds. When planning PRs from a roadmap, batch items until the estimate approaches ~100 files, grouping by what they touch so the coupling stays inside one review: items that share a schema section, a router, or a settings object belong in the same PR — splitting them creates stacked branches that can't start until their parent merges. Items whose only overlap is additive (a new row on a shared blade) can safely land in separate PRs with a stated merge order.

## When to Exclude

Chunk at the budget where you can. A mechanical rename can't be chunked — it's one atomic commit — so exclude the files within it that carry no reviewable content.

Exclude only files with **no reviewable content change**. Two kinds qualify:

- **Pure renames** — 100% similarity, zero content change (`R100`).
- **Rename-token-only edits** — the file's only diff is the mechanical substitution itself (e.g. every `File` identifier → `Sheet`). The live block covers both, and its header comment says so.

A file that was renamed _and_ carries a real logic change still needs review. When in doubt, leave it in.

## Generating the List

`R100` is git's marker for a rename with no content change — it gets you the pure-rename subset for free:

```bash
git diff --name-status -M <base>..<head> | awk '$1=="R100"{print "    - \"!" $3 "\""}' | sort
```

Rename-token-only edits are not `R100` (they have a content diff), so they can't be auto-detected — review those diffs and add them by hand.

Verify the count matches what you expect before committing, and validate the result parses:

```bash
node -e "
const fs=require('node:fs');
// js-yaml is only a transitive dep, so pnpm's strict layout leaves it unresolvable by bare name -
// reach into .pnpm, but discover the version rather than pinning it.
const [dir]=fs.readdirSync('node_modules/.pnpm').filter((d)=>d.startsWith('js-yaml@'));
const yaml=require('./node_modules/.pnpm/'+dir+'/node_modules/js-yaml');
const d=yaml.load(fs.readFileSync('.coderabbit.yaml','utf8'));
console.log('path_filters:', d.reviews.path_filters.length);
"
```

## The Commit Pair

Exclusions are always temporary. Every exclusion commit names its own revert so the cleanup is unambiguous later.

**Adding** — subject is `chore: exclude <scope> from CodeRabbit review`. The body states why, and quotes the exact removal subject:

```text
chore: exclude File -> Sheet rename files from CodeRabbit review

The File -> Sheet resource rename touches 800+ files, of which 732 are pure
renames or rename-token-only edits with no reviewable content change. Exclude
those so the review stays under the free-tier file limit and focuses on the
files that actually changed.

Revert with "chore: re-enable CodeRabbit review for File -> Sheet rename
files" once the rename PR merges.
```

**Removing** — subject is `chore: re-enable CodeRabbit review for <scope>`, reusing the same `<scope>` wording:

```text
chore: re-enable CodeRabbit review for File -> Sheet rename files

The rename PR has merged, so these files are reviewable again.
```

Mark the temporary block in the yaml with a comment naming its scope, so "remove the exclusions" resolves to an exact set of lines:

```yaml
# pure renames from the File -> Sheet resource rename (no content change);
# remove these once that PR merges
```

## Removal Procedure

When the user says "remove the exclusions" or "re-enable review":

1. `git switch develop && git pull --ff-only origin develop` — **the base branch, not `main`.** Removing the block from `main` is a no-op: the live exclusions are on `develop`, which is what PRs are reviewed against.
2. Delete the commented temporary block from `.coderabbit.yaml`, leaving the permanent entries
3. Commit as `chore: re-enable CodeRabbit review for <scope>`, taking `<scope>` from the block's comment
4. Push to `develop`

Verify the block is actually gone from the branch that matters (`git show develop:.coderabbit.yaml | grep -c '"!'` should drop to the permanent-entry count). If more than one temporary block exists, ask which scope to remove rather than clearing all of them.
