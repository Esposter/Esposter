---
name: coderabbit
description: Apply when fetching, addressing or replying to CodeRabbit comments, nitpicks, minors or outside-diff-range findings, when reading the CodeRabbit check on any PR, or when changing .coderabbit.yaml. Esposter CodeRabbit conventions — what the bot does and what that makes true for every session: auto-review only on default-branch PRs, the config read from the base branch, never pushing into a running review, the one file cap constant, and every finding of a run answered with the fix pushed first. The session's push loop and the collector are the review-queue skill's.
---

# CodeRabbit Conventions

What the bot does, and what that makes true for every session. The session's own loop — pushing `ai/queue`, never `develop` — is the `review-queue` skill; the collector that clears the gates, drains findings and cuts windows is `apps/web/content/docs/infra/review-collector/`.

## Settled — do not re-propose

- **Replacing the bot** with a paid tier or a per-push review. The drain pays only where a finding exists, and both alternatives pay per push; the case is `apps/web/content/docs/infra/review-collector/index.md`.
- **A `schedule` trigger in place of the collector's delayed retrigger.** No polling is the standing rule (`apps/web/content/docs/architecture/no-polling.md`), and the one deadline a clock would wake for is one the bot states (`apps/web/content/docs/infra/review-collector/runner.md`).
- **Adding `develop` to the "reviews.auto_review.base_branches" list** so develop-base PRs review themselves. It turns every intermediate PR into a spent slot; a develop-base PR is triggered by hand with `@coderabbitai review` ("What Triggers a Review").
- **Grepping the review body for the word "nitpick"** to collect them. The buckets are not a fixed set — duplicates, refactor suggestions and an additional-comments block appear once a review carries many — so a grep silently drops whichever bucket it did not name (`references/review-feedback.md`).
- **Force-pushing `develop` to make a window fit.** A rewind desynchronises CodeRabbit's incremental checkpoint and it does not recover: the review after one anchors on the start of its own range, so every later window is counted from a sha whose files were already reviewed and arrives over the cap however small it measured. The collector only ever fast-forwards `develop`.

## What Triggers a Review

CodeRabbit auto-reviews **only PRs targeting the default branch (`main`)** — on creation and on every push. Develop-base PRs are skipped ("Auto reviews are disabled on base/target branches other than the default branch") and are triggered by commenting `@coderabbitai review`, which keeps control of _when_ a review starts and stops every intermediate push spending a slot. `.coderabbit.yaml` is read from the PR's **base branch**, so a config change takes effect only once it is there — `references/config-editing.md`.

A review slot is about an hour, and a PR against `main` spends one on arrival: the release PR is the collector's to open, and any other PR against `main` is asked for every time, with its commit range settled before `gh pr create` because the moment after it is already an in-flight review. Corrections found after opening are a later push's commits; the body may be edited freely. A collaborator's PR never targets `main` for the same reason — it is opened from an `external/*` branch against `ai/queue` and squash-merged there (`apps/web/content/docs/infra/branch-namespaces.md`).

## Never Push Into an In-Flight Review

Pushing while a review runs cancels it and retriggers a fresh one, costing a slot and losing the in-progress findings. CodeRabbit is **incremental** — it does not re-review commits it has already reviewed — so a cancelled review's comments do not come back.

```bash
gh pr checks --json name,state,bucket,description --jq '.[] | select(.name=="CodeRabbit")'
# {"bucket":"pass","description":"Review rate limited","name":"CodeRabbit","state":"SUCCESS"}
```

**Read `bucket` first, then `description`.** `bucket` is gh's normalization across both representations a check can take — CodeRabbit posts a commit status while Actions entries on the same PR are check runs — so `pending` means a live review whatever is reported underneath.

| bucket / description                          | meaning                        | push?                         |
| :-------------------------------------------- | :----------------------------- | :---------------------------- |
| `pending` (any description)                   | live review, a push cancels it | **wait**                      |
| `pass` / `Review completed`                   | finished                       | push                          |
| `pass` / `Review rate limited`                | never started, nothing running | **push**                      |
| `pass` / skip comment says `Too many files`   | never started                  | push, but fix the count first |
| `fail`, missing row, or anything unrecognised | unknown                        | **wait**, then look           |

The last row is the default: being wrong about a running review costs its findings and a slot, being wrong about a finished one costs a minute. The collector's gate answers that row differently on purpose — nothing re-fires a cycle that exits quietly, so it fails the run red where a person waits and looks. `Review completed` names no range: it is the status of whichever review ran most recently, never clearance for the current head — the frontier is the last sha a review body names, and the collector reads it from there.

Symptoms that a push landed mid-review: a `> [!CAUTION] Failed to replace (edit) comment` / `putComment timed out` comment from the bot, or a review returning far fewer comments than the diff warrants.

## The File Cap

The cap is one constant, `REVIEW_FILE_CAP` in `scripts/src/services/coderabbit/shared/constants.ts` — the Open Source tier's limit is popularity-scaled and can move, so the bot's skip comment states the current one and the constant is where it is written, never a page: a test fails on a number written into this skill, the `review-queue` skill or the collector's docs. Past the cap CodeRabbit skips the review outright rather than trimming it, which is why the collector measures the window on the tree it is about to push and stops before the first commit that would cross it — and repackages a commit that crosses it alone, rather than holding on it. There is no floor to go with the cap: the port takes everything the queue owes, so a window comes out small only when that is all there was, and holding it back would only leave the queue unsynced for longer.

## Reading and Answering Findings

**"Fix the CodeRabbit comments" means every finding the run produced**, at every severity and in every place the run put one — nobody has to list the categories, and a request naming one of them is not scoped to it. Severity and delivery channel are different axes: a minor arrives as an inline thread as readily as a major, and it is the channel, never the severity, that decides whether a fetch finds it.

Every finding gets a reply — the verdict first, then the evidence, rejected ones included — posted after the fix commits are pushed, and nothing is accepted unverified. Where each kind of finding lives, what the stated counts prove, what a reply owes, and answering an invalid class in `.coderabbit.yaml`: `references/answering-findings.md`.

## Deep Dives

- `references/answering-findings.md` — when a completed review's findings are being collected, fixed and replied to.
- `references/review-feedback.md` — when fetching a PR's feedback, counting what is still open, or replying to a comment.
- `references/config-editing.md` — when changing `.coderabbit.yaml`.
