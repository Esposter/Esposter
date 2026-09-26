---
name: coderabbit
description: Apply when fetching, addressing or replying to CodeRabbit comments, nitpicks, minors or outside-diff-range findings, when reading the CodeRabbit check on any PR, or when changing .coderabbit.yaml. Esposter CodeRabbit conventions — what the bot does and what that makes true for every session: auto-review only on default-branch PRs, the config read from the base branch, never pushing into a running review, the one file cap constant, and every finding of a run answered with the fix pushed first. The session's push loop and the collector are the review-queue skill's.
---

# CodeRabbit Conventions

What the bot does, and what that makes true for every session. The session's own loop — pushing `ai/queue`, never `develop` — is the `review-queue` skill; the collector that clears the gates, drains findings and cuts windows is `apps/web/content/docs/infra/review-collector/`.

## Settled — do not re-propose

- **Replacing the bot** with a per-push review, or buying reviews past the plan's included ones. The drain pays only where a finding exists, and both alternatives pay per push; the case is `apps/web/content/docs/infra/review-collector/index.md`.
- **A `schedule` trigger in place of the collector's delayed retrigger.** No polling is the standing rule (`apps/web/content/docs/architecture/no-polling.md`), and the one deadline a clock would wake for is one the bot states (`apps/web/content/docs/infra/review-collector/runner.md`).
- **Adding `develop` to the "reviews.auto_review.base_branches" list** so develop-base PRs review themselves. It turns every intermediate PR into a spent slot; a develop-base PR is triggered by hand with `@coderabbitai review` (`references/triggers.md`).
- **Grepping the review body for the word "nitpick"** to collect them. The buckets are not a fixed set — duplicates, refactor suggestions and an additional-comments block appear once a review carries many — so a grep silently drops whichever bucket it did not name (`references/review-feedback.md`).
- **A confirmation gate on a repo script whose side effect is restartable or regenerable** — the process kill in `pnpm refresh:lockfile`, a snapshot a build rewrites, a generated file a script replaces. The session runs it unattended and the answer to the prompt is always yes, so the finding is closed by the Settled line the owning skill carries for that script (`dependency-updates` for the kill), never by adding the gate or asking the user first.
- **Trusting an incremental review** — turning `auto_incremental_review` back on, or pushing fixes to an open release. The bot declined an incremental review it could not recover, flipped its check to completed, and a release merged over commits no review read. A release gets one full review and merges when it completes; its findings are drained into the next window, whose own full review reads the fixes (`apps/web/content/docs/infra/review-collector/collection-cycle.md`, Notes).

## What Triggers a Review

Only a pull request against `main` reviews itself, and only on creation — incremental reviews are off; any other base is asked with `@coderabbitai review`, and `.coderabbit.yaml` is read from the base branch (`references/triggers.md`).

## Never Push Into an In-Flight Review

A push during a review cancels it and loses its findings for good: read the CodeRabbit check's `bucket` first, and anything but a finished or never-started review means wait (`references/in-flight-reviews.md`).

## The File Cap

The cap is one constant, `REVIEW_FILE_CAP`, and never a number written anywhere else; past it the bot skips outright, which is why the collector measures each window (`references/file-cap.md`).

## Reading and Answering Findings

**"Fix the CodeRabbit comments" means every finding the run produced**, at every severity and in every place the run put one — nobody has to list the categories, and a request naming one of them is not scoped to it. Severity and delivery channel are different axes: a minor arrives as an inline thread as readily as a major, and it is the channel, never the severity, that decides whether a fetch finds it.

Every finding gets a reply — the verdict first, then the evidence, rejected ones included — posted after the fix commits are pushed, and nothing is accepted unverified. Where each kind of finding lives, what the stated counts prove, what a reply owes, and answering an invalid class in `.coderabbit.yaml`: `references/answering-findings.md`.

## Deep Dives

- `references/answering-findings.md` — when a completed review's findings are being collected, fixed and replied to.
- `references/review-feedback.md` — when fetching a PR's feedback, counting what is still open, or replying to a comment.
- `references/config-editing.md` — when changing `.coderabbit.yaml`.
- `references/triggers.md` — when opening a pull request, asking for a develop-base review, or expecting a config change to apply.
- `references/in-flight-reviews.md` — before pushing to a reviewed pull request, or when a review looks cut short.
- `references/file-cap.md` — when a review is skipped for too many files, or a window's size is in question.
