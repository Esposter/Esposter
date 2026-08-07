---
name: coderabbit
description: Esposter CodeRabbit review conventions — .coderabbit.yaml is read from the PR base branch and edited there in a worktree, never add reviews.auto_review.base_branches (develop-base PRs are triggered manually with @coderabbitai review), opening or pushing to a default-branch PR spends a review slot, never push into a running review, the ~80-file budget that refreshes per incremental review cycle, nitpicks live in the review body rather than inline comments, the coderabbitai[bot] login and reconciling against the stated counts, replying to every finding, plus deep dives on retrieving feedback across all three endpoints, cutting an over-budget release PR onto a queue branch, which files may be excluded and how to generate the list, and the standardized exclude/re-enable commit pair. Apply when fetching, addressing, or replying to CodeRabbit comments or nitpicks, before any git push to a branch with an open PR, when a PR is too large for review, when excluding files from CodeRabbit, or when the user says "remove the exclusions".
---

# CodeRabbit Conventions

## Config Is Read From the PR Base Branch

`.coderabbit.yaml` sits at the repo root, and CodeRabbit reads it from the **base branch** of a PR, never the head branch. A config change only takes effect once it is on that branch, so **read the base off the PR rather than assuming it** — feature PRs target `develop`, but the long-lived release PR is `develop` → `main`, and for that one the change must land on `main`:

```bash
gh pr view <pr> --json baseRefName --jq .baseRefName   # the branch whose config applies
git show <base-branch>:.coderabbit.yaml | head -20     # the config CodeRabbit actually applies
```

- Commit config changes **directly to that base branch**, as a standalone commit separate from the work they cover. A config change on the head branch does nothing.
- Editing the base branch does not mean checking it out over your work: `git worktree add <scratch-path> <base-branch>`, commit there, push, then `git worktree remove`. The working tree keeps whatever is in flight, which matters when agents are mid-edit in it. Rebase inside the worktree before pushing — the base branch moves under you (Renovate).
- The two branches diverging is expected: `develop` can carry a temporary exclusion block while `main` carries only the permanent entries, picking the block up on a release merge and losing it when the block is removed.

CodeRabbit auto-reviews **only PRs targeting the default branch (`main`)** — develop-base PRs are skipped with "Auto reviews are disabled on base/target branches other than the default branch". Trigger those manually by commenting `@coderabbitai review` on the PR.

**Never add `reviews.auto_review.base_branches` to `.coderabbit.yaml`.** Manual triggering on develop-base PRs is deliberate, not a gap waiting to be closed: it keeps control of _when_ a review starts — which is what makes the never-push-into-a-running-review rule below workable — and it stops every intermediate push spending a rate-limit slot. If a PR was not reviewed, comment `@coderabbitai review`; do not change the config. The setting reads like an obvious fix and has been "helpfully" added before.

## Opening a PR Spends a Review Slot

**Creating a PR against the default branch, and every push to one, starts a review** — the slot goes immediately and the next is about an hour out.

So ask first, every time. Agreement on the goal ("get this reviewed") is not permission to spend the slot before the shape is settled — the commit range, the cut point, and the base's `.coderabbit.yaml` all have to be final. Until then push the branch and stop: a branch is free and re-cuttable, a PR is not. Opened one too early? Close it — the slot is already gone and the commits stay reviewable under the PR they belong to.

## Never Push Into an In-Flight Review

**Check CodeRabbit's state before every push to a branch with an open PR.** Pushing while a review is running cancels it and retriggers a fresh one, which costs a rate-limit slot and loses the in-progress review's findings. CodeRabbit is an **incremental** system — it does not re-review commits it has already reviewed — so a cancelled review's comments do not reliably come back on the next run. They are simply gone.

```bash
gh pr checks --json name,state,description --jq '.[] | select(.name=="CodeRabbit")'
# {"description":"Review completed","name":"CodeRabbit","state":"SUCCESS"}
```

Push only on `SUCCESS` / `Review completed`. Anything else (`PENDING`, a review-in-progress description) means **wait** — poll until it settles, then push. With no open PR for the branch there is no review to interrupt; push freely.

This applies per push, not per work session — a second push minutes after the first lands while the first push's review is still running. Batch commits and push once when the work is coherent.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from `coderabbitai[bot]`, or a review that silently returns far fewer comments than the diff warrants.

## PR File Budget

CodeRabbit caps this repo at **100 files per review** — the Open Source tier's file limit is popularity-scaled and can move, so treat the number as current-best-known; the bot's skip comment on an over-budget PR states the current one. Keep every chunk of work to **~80 changed files measured from the branch point** — work is committed and pushed continuously, so dirty-file counts see nothing:

```bash
git diff --name-only "$(git merge-base <base-branch> HEAD)" | wc -l   # committed changes since branching
git status --porcelain -uall | wc -l                                  # plus anything not yet committed
```

Run both and sum before starting a sweep. When the budget is reached, stop and hand back for a PR.

**Incremental reviews refresh the budget.** CodeRabbit reviews only the files changed _since its last completed review_ on the PR (the review body states it: "Reviewing files that changed … between `<sha1>` and `<sha2>`"), not the cumulative PR diff. So within one long-lived PR the ~80-file budget applies **per review cycle**: a retrigger or a new push only needs the _newly committed_ files to stay under it. Once a PR has been reviewed, measure the delta rather than the merge-base — `git diff --name-only <last-reviewed-sha>..HEAD | wc -l`. The merge-base count still governs the **first** review of a PR and any full re-review.

The budget is a **target to fill, not only a cap**. A single roadmap item is typically 8–15 files, so one-item-per-PR wastes most of a review slot and multiplies review rounds. When planning PRs from a roadmap, batch items until the estimate approaches ~80 files, grouping by what they touch so the coupling stays inside one review: items sharing a schema section, a router, or a settings object belong in the same PR — splitting them creates stacked branches that can't start until their parent merges. Items whose only overlap is additive (a new row on a shared blade) can land in separate PRs with a stated merge order.

**Being over budget is never a reason to exclude a file.** Over budget is a chunking problem: split the work, or land it in stages so each incremental cycle stays under the cap. Excluding substantive files buys a smaller review, not a better one — the diff still ships, just unread.

## Reading and Answering Findings

- **Nitpicks live only in the review body**, inside the collapsed `🧹 Nitpick comments (M)` block — they are never inline comments. Fetching only the inline endpoint loses them silently.
- **The bot's login is `coderabbitai[bot]`, not `coderabbitai`.** A `--jq` filter on the wrong login returns empty and exits 0, so empty output from a filtered query means _"my filter was wrong"_ until proven otherwise — never read it as "there are none".
- **Reconcile before concluding.** Each review body states `Actionable comments posted: N` and `🧹 Nitpick comments (M)`. Both counts are ground truth: fewer inline comments or nitpicks in hand than that means you are missing some — go find them rather than reporting what you happened to fetch.
- **Reply to every finding, including rejected ones** — a silent skip is indistinguishable from an oversight. State the verdict in the first line (`Agreed, fixed in <sha>` / `Not a real issue, no change`) and give the evidence; these threads are the record of why the code looks the way it does.
- **Verify before accepting.** CodeRabbit reasons from names and prior "learnings" and will confidently assert semantics the code does not have — check the implementation, and when it flags a pattern, grep for the repo's existing convention rather than taking the suggested diff. If a finding is real, check whether its twin exists elsewhere; the scan is per-file and routinely stops one file short.

## Deep Dives

- `references/review-feedback.md` — when fetching a PR's CodeRabbit feedback or replying to a comment (the three endpoints and the reply call).
- `references/release-pr-cutting.md` — when a PR has grown past the file limit and its review is skipped outright.
- `references/exclusions.md` — when deciding whether a file may be excluded from review, generating the exclusion list, or removing the exclusions.
