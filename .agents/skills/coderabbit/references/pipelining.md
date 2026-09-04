# Pipelining a push against a running review

Read when planning the push cadence on `develop` — how work keeps moving while a review runs, and where a window boundary falls. This page holds the whole procedure; `SKILL.md` keeps the cap, the gates and the finding rules it operates under.

## Work lands on `develop`, the review runs against the `develop` → `main` PR

**There are no per-chunk feature branches.** Work is committed and pushed straight to `develop`, and the single long-lived PR is `develop` → `main`. Because that PR's base is the default branch, every push to `develop` auto-triggers a review — no trigger comment, no PR per chunk. Keeping that PR open is what makes the pipeline work.

1. Commit continuously on `develop`. When the delta since the last reviewed sha approaches ~90 files, that chunk is ready.
2. Push it. The push starts a review.
3. **Keep working locally while it runs.** Commits are free; only pushes trigger reviews. The local commit queue is what absorbs the hour.
4. When the review completes, address its findings, commit the fixes, verify, and push them **together with** the next queued chunk — then reply to every finding. That single push starts the next cycle. Replying last is what makes a reply checkable: it can name the commit that answers the finding, where a reply written before the push points at nothing.
5. Repeat, so review effort tracks the work instead of gating it.

**Verification does not gate the push.** `format`/`typecheck`/`lint`/tests are minutes of wall-clock each and a
review slot is an hour, so holding a finished chunk until the checks come back spends the scarce resource to
protect the cheap one — and the checks were going to run either way. Push the chunk, then run them against the
same tree while the review works; a failure found afterwards is one more commit in the next window, which is
where its fix belongs anyway. Correctness on `develop` is eventual, and the branch is not the release. The
repo's finishing ritual still runs in full — the change is only that its verification steps stop standing
between the commit and the push.

**Cut the commits, not the push.** The window boundary is whatever sha the push names, so the way to fill a slot
to ~90 files without splitting a coherent change across two reviews is to commit in finer pieces and push
through the last one that fits. Never undo working-tree edits to make a window smaller: the work stays
committed and the tail is simply held, so nothing is redone and nothing is lost. A rename too large for one
window splits by **which identifiers it renames**, never by which files, so every commit is green on its own.

## Re-opening the standing PR after it merges

The pipeline assumes the `develop` → `main` PR is open; once it merges there is none, and the next window has to
open one. That is a slot spend like any push, so it is asked for rather than assumed (`SKILL.md`, "Opening a PR
Spends a Review Slot").

Size that window from the **merge base**, not from a reviewed sha — a PR's first review reads the cumulative diff
(`references/measuring-the-window.md`), so the count is
`git fetch origin main && git diff --name-only $(git merge-base origin/main HEAD)..HEAD` and the ~90-file target
applies to it whole. Everything already on `main` is outside it, which is why the merge base rather than `main` is
the left-hand side — and the fetch is load-bearing rather than hygiene, because this measurement is taken exactly
once the previous PR has merged: `origin/main` is a remote-tracking ref, so an unfetched one still points at the
commit before that merge and the merge base walks back past it, counting the whole merged window a second time.

```bash
git push origin develop
gh pr create --base main --head develop --title "<type>(<scope>): <what the window carries>" --body "<summary>"
```

The body is the window's summary rather than the last commit's: what moved, what was deliberately left and why
(the same reasons the commit messages carry), and a test plan naming the checks that were run. A reader arriving
at the PR should not have to read sixteen commits to learn what one window did.

The invariant: a chunk is a **push** boundary, not a work boundary. If step 4's fixes plus the queued chunk exceed the budget, push the fixes with only part of the queue and hold the rest — never split a fix away from the finding it answers. Which commits ride in a window, and how a late-authored fix is moved to its front: `references/window-composition.md`.
