---
name: coderabbit
description: Esposter CodeRabbit review conventions — retrieving review feedback across all three endpoints (nitpicks live in the review body, not inline comments; the bot login is coderabbitai[bot]), replying to findings, checking review state before pushing (never push into a running review), .coderabbit.yaml is read from the PR base branch (normally develop), per-file path_filters for mechanical renames, and the standardized exclude/re-enable commit pair. Apply when fetching, addressing, or replying to CodeRabbit comments or nitpicks, before any git push to a branch with an open PR, when a PR is too large for review, when excluding files from CodeRabbit, or when the user says "remove the exclusions".
---

# CodeRabbit Conventions

## Config Is Read From the PR Base Branch

`.coderabbit.yaml` sits at the repo root. CodeRabbit reads it from the **base branch** of a PR, not the head branch. An exclusion only takes effect once it is on the branch the PR is based against, so **read the base off the PR rather than assuming it** — feature PRs target `develop`, but the long-lived release PR is `develop` → `main`, and for that one exclusions must land on `main`:

```bash
gh pr view <pr> --json baseRefName --jq .baseRefName   # the branch whose config applies
```

Editing that branch does not mean checking it out over your work: `git worktree add <scratch-path> <base-branch>`, commit the config change there, push, then `git worktree remove`. The working tree keeps whatever is in flight — which matters when agents are mid-edit in it. Rebase inside the worktree before pushing; the base branch moves under you (Renovate).

CodeRabbit auto-reviews **only PRs targeting the default branch (`main`)**: develop-base PRs are skipped with "Auto reviews are disabled on base/target branches other than the default branch". Trigger a review on a develop-base PR manually by commenting `@coderabbitai review` on it.

**Never add `reviews.auto_review.base_branches` to `.coderabbit.yaml`.** Manual triggering on develop-base PRs is deliberate, not a gap waiting to be closed: it keeps control of _when_ a review starts, which is what makes the never-push-into-a-running-review rule below workable, and it stops every intermediate push from spending a rate-limit slot. A skipped develop-base PR is the configured behaviour — if a PR was not reviewed, comment `@coderabbitai review`, do not change the config. This entry exists because the setting reads like an obvious fix and has been "helpfully" added before.

Commit exclusions **directly to the PR's base branch** — the `baseRefName` read above, not a hard-coded `develop` — as a standalone commit, separate from the work they cover. An exclusion committed on the head branch does nothing.

The two branches diverge and that is expected: `develop` carries the live temporary exclusion block, `main` carries only the permanent entries (it picks up the block on release merges and loses it when the block is removed). Always check the branch you are actually on:

```bash
git show develop:.coderabbit.yaml | head -20   # the config CodeRabbit actually applies to PRs
```

## Why Per-File, Not Globs

CodeRabbit's `path_filters` are static globs with no notion of "this file was only renamed". A glob like `!packages/app/app/services/resource/sheet/**` excludes that tree for **every future PR**, permanently blinding review of real changes until someone remembers to revert it.

List every excluded file explicitly instead. It is verbose, and that verbosity is the point — a several-hundred-line block is obviously temporary and obviously scoped, where a 3-line glob quietly rots.

Keep permanent structural entries (`!pnpm-lock.yaml`, generated migrations) at the top of `path_filters`, above any temporary block.

## Opening a PR Spends a Review Slot

Auto-review is on for PRs targeting the default branch. **Creating such a PR, and every push to one, starts a review** — the slot goes immediately and the next is about an hour out.

So ask first, every time. Agreement on the goal ("get this reviewed") is not permission to spend the slot before the shape is settled — the commit range, the cut point, and the base's `.coderabbit.yaml` all have to be final. Until then push the branch and stop: a branch is free and re-cuttable, a PR is not.

Opened one too early? Close it. The slot is already gone and the commits stay reviewable under the PR they belong to.

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

CodeRabbit caps this repo at **100 files per review** — the Open Source tier's file limit is popularity-scaled and can move, so treat the number as current-best-known rather than fixed. If the limit needs re-checking, the bot's skip comment on an over-budget PR states the current number. Keep every chunk of work to **~80 changed files measured from the branch point** — work is committed and pushed continuously, so dirty-file counts see nothing:

```bash
git diff --name-only "$(git merge-base <base-branch> HEAD)" | wc -l   # committed changes since branching (base is what this branch was cut from, e.g. develop)
git status --porcelain -uall | wc -l                                  # plus anything not yet committed
```

Run both and sum before starting a sweep. When the budget is reached, stop and hand back for a PR.

**Incremental reviews refresh the budget.** CodeRabbit reviews only the files changed _since its last completed review_ on the PR (the review body states it: "Reviewing files that changed … between `<sha1>` and `<sha2>`"), not the cumulative PR diff. So within one long-lived PR the ~80-file budget applies **per review cycle** and refreshes after each completed review — a retrigger (`@coderabbitai review`) or a new push only needs the _newly committed_ files to stay under budget. Once a PR has already been reviewed, measure the delta since the last reviewed commit, not the merge-base:

```bash
git diff --name-only <last-reviewed-sha>..HEAD | wc -l   # what the next incremental review will actually see
```

The merge-base count above still governs the **first** review of a PR (and any full re-review).

The budget is a **target to fill, not only a cap**. A single roadmap item is typically 8–15 files, so one-item-per-PR wastes most of a review slot and multiplies review rounds. When planning PRs from a roadmap, batch items until the estimate approaches ~80 files, grouping by what they touch so the coupling stays inside one review: items that share a schema section, a router, or a settings object belong in the same PR — splitting them creates stacked branches that can't start until their parent merges. Items whose only overlap is additive (a new row on a shared blade) can safely land in separate PRs with a stated merge order.

## Cutting the Release PR Back to the Budget

The release PR (`develop` → `main`) can't be planned to a budget — it accumulates whatever merged, and CodeRabbit skips it outright once it passes the file limit ("Review skipped: N files exceed the limit of 100"). The fix is to **shorten `develop` and park the rest on a queue branch**, then feed the queue back one window at a time.

Never open side PRs against `main` to slice it up. Each one spends a review slot on arrival, and the release PR is not the thing that needs splitting — its _review cycles_ are.

**There are only ever two branches: `develop` and `queue/<scope>`. One PR: the release PR, which stays open the whole time.**

### 1. Cut

Cut by commit window, not by file, at a merge boundary — the cumulative count jumps there, each jump is one topical cluster, and any prefix is coherent history by construction:

```bash
for commit in $(git rev-list --reverse <base>..develop); do
  printf '%4d  %s\n' "$(git diff --name-only -M "<base>..$commit" | wc -l)" "$(git log -1 --oneline "$commit")"
done
```

Take the boundary nearest ~80 files. Park, cut, then re-base the park onto the cut:

```bash
git branch queue/<scope> develop && git push origin queue/<scope>   # nothing lost yet
git reset --hard <cut> && git push --force-with-lease origin develop
git rebase --onto develop <cut> queue/<scope> && git push --force-with-lease origin queue/<scope>
```

The rebase is what makes it two branches instead of three: without it the queue is a copy of `develop` plus the remainder. Cherry-picked doc commits replay as no-ops, or conflict if reworded since — `git rebase --skip` them, `develop`'s version is newer. Verify before force-pushing the queue: `git diff --stat <old-queue-head> queue/<scope>` should show only files you knowingly reworded.

Cherry-pick doc and skill commits across the cut so the working tree keeps the conventions it is being asked to follow.

### 2. Drain

Merge one queue window into `develop`, trigger a review, wait for `Review completed`, fix findings, then merge the next. Reviews are incremental — each cycle reads only what changed since the last completed one (§PR File Budget) — so every window gets a full-budget review even though the PR's cumulative diff grows past the cap.

### 3. Merge

Merge the release PR to `main` only when the queue is empty and every window came back clean.

Three things break the scheme:

- **Pushing before the running review reports `Review completed`** — it cancels that review and its findings do not come back.
- **Asking for a full re-review** — it re-reads the cumulative diff and trips the file limit again.
- **A force-push while a review is running** — the cut in step 1 retriggers the open PR's review like any other push, so check the state first and check no other session is pushing `develop`.

Counts don't subtract: a file touched in two windows counts in both, so the remainder is bigger than `total - prefix`. Measure it — `git diff --name-only -M develop..queue/<scope> | wc -l`.

## When to Exclude

Chunk at the budget where you can. A mechanical rename can't be chunked — it's one atomic commit — so exclude the files within it that carry no reviewable content.

**Every exclusion is derived from an open PR's diff.** Enumerate what that PR actually changed, classify each file, and list the ones that qualify. Never write an exclusion for a file class the repo merely _could_ produce — a speculative glob block (generated artifacts, binaries, vendored assets) added outside a PR is unreviewed config change for no benefit, and it silently blinds every later PR that does touch those paths. A class earns a permanent entry only when a real PR puts it in a diff.

Exclude only files with **no reviewable content change**. Three kinds qualify:

- **Pure renames** — 100% similarity, zero content change (`R100`).
- **Rename-token-only edits** — the file's only diff is the mechanical substitution itself (e.g. every `File` identifier → `Sheet`). The live block covers both, and its header comment says so.
- **Import-path-only edits** — a module moved (`@/` → `#shared`, say) and the file's entire diff is the rewritten import lines. Confirm it mechanically rather than by eye: every `+`/`-` line in the file's diff must be an `import` line.

A file that was renamed _and_ carries a real logic change still needs review. When in doubt, leave it in.

**Being over budget is never a reason to exclude a file.** Over budget is a chunking problem: split the work into a second PR, or land it in stages so each incremental review cycle stays under the cap (§PR File Budget). Excluding substantive files buys a smaller review, not a better one — the diff still ships, just unread.

Never excludable, whatever the budget:

- **Documentation** (`packages/app/content/docs/**`) — docs are the design record, not commentary. A wrong standard there propagates into every change built on it afterward, and prose is precisely what a human reviewer catches and no typechecker can.
- **Agent skills** (`.claude/skills/**`) — a skill binds every future agent session. An unreviewed wrong rule is worse than unreviewed wrong code, because it silently authors more wrong code.
- **Tests** (`*.test.ts`, `*.test-d.ts`) — tests are the behaviour contract. One asserting the wrong thing is a defect that passes CI forever, and "the source it covers is still reviewed" does not catch it — the reviewer sees green assertions and infers the intent from them.
- **Config, schema, and migration inputs** — small diffs with large blast radius.

The rule reduces to: exclude a file only when its diff carries no information a reviewer could act on. Anything else stays in, and the PR gets smaller instead.

## Generating the List

`R100` is git's marker for a rename with no content change — it gets you the pure-rename subset for free:

```bash
git diff --name-status -M <base>..<head> | awk '$1=="R100"{print "    - \"!" $3 "\""}' | sort
```

Import-path-only edits are found by demanding every changed line in a file's diff be an import — no commit-shape assumption needed, so this works on any PR:

```bash
git diff --name-only -M <base>..<head> | while IFS= read -r path; do
  # -U0 so context lines can't be mistaken for changes; the +++/--- headers are dropped
  changed=$(git diff -U0 -M <base>..<head> -- "$path" | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)')
  [ -z "$changed" ] && continue
  printf '%s\n' "$changed" | grep -qvE '^[+-][[:space:]]*(import[[:space:]]|$)' || echo "    - \"!$path\""
done
```

Rename-token-only edits are not `R100` (they have a content diff), but when the sweep landed as **its own commit** they can be classified **exactly** — by replaying the substitution and demanding the result reproduce the committed blob byte-for-byte. Never classify by line counts: a token substitution rewrites each affected line in place, so `--numstat` is symmetric, but a balanced logic edit is symmetric too and the filter cannot tell them apart.

Set `SED` to the sweep's substitutions (one `-e` per rename) — GNU sed, whose `\b` word boundary the identifier substitutions rely on — then:

```bash
set -euo pipefail
SHA=<rename-sha> SED='s/\bOldName\b/NewName/g'
# a partial path list silently under-protects files, so build it in a checked loop rather than
# `grep -v | xargs` — an empty commit list must not fall through to `git show` on HEAD
otherPaths=$(mktemp)
trap 'rm -f "$otherPaths"' EXIT
# every sibling commit in the range, not just one — a file any of them touched is reviewable
git rev-list <base>..<head> | while IFS= read -r commit; do
  [ "$commit" = "$SHA" ] && continue
  git show --name-only --format="" "$commit"
done | sort -u > "$otherPaths"
git diff -M --name-status "$SHA^" "$SHA" | while IFS=$'\t' read -r status old new; do
  # R carries old and new paths; M reuses the one path. A/D are content decisions, never mechanical
  case "$status" in
    R*) path_old="$old"; path_new="$new" ;;
    M)  path_old="$old"; path_new="$old" ;;
    *)  continue ;;
  esac
  # both paths are tested: a rename out of a protected tree is still a change to that tree, and a
  # sibling commit that touched the pre-rename path is a content change this file carries
  isKept=""
  for path in "$path_old" "$path_new"; do
    # §When to Exclude never lets these out, whatever the diff says
    case "$path" in
      *.test.ts|*.test-d.ts|packages/app/content/docs/*|.claude/skills/*) isKept=1 ;;
      *.yaml|*.yml|*.json|*.config.ts|packages/db-schema/*|packages/app/server/db/migrations/*) isKept=1 ;;
    esac
    grep -qxF "$path" "$otherPaths" && isKept=1
  done
  [ -n "$isKept" ] && continue
  # exact: replaying the substitution on the parent must reproduce the committed blob
  if git show "$SHA^:$path_old" | sed "$SED" | cmp -s - <(git show "$SHA:$path_new"); then
    echo "    - \"!$path_new\""
  fi
done
```

`cmp` is the whole guarantee: if replaying the substitution reproduces the file exactly, there is by construction no other content change, so this cannot admit a balanced logic edit. It errs only toward keeping files reviewable — a rename that forced a reformatter rewrap, or a sweep whose `SED` you under-specified, fails the compare and stays in. On a multi-hundred-file sweep the line-symmetry filter it replaces admitted roughly two-thirds of the commit on no evidence at all, where the replay admits only files whose every changed line it can account for.

If the sweep is mixed into a commit carrying other work, there is no parent blob to replay against — read the diffs by hand.

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

The File -> Sheet resource rename touches <total> files, of which <excluded> are pure
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
