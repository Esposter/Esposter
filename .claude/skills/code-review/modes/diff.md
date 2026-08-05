# diff mode — reviewing a change

The default. Anchored on a change: working tree, branch, or PR. The change bounds the review, so the run terminates naturally when the diff is exhausted.

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "<level> [target]" });
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "diff <level> [target]" });
```

`diff` is implied when the first word is not a mode name, so both forms are the same run. `target` is optional: a PR number, branch, ref range, path, or free-form instruction (`"only review src/foo.ts"`). Omit it for the working diff.

## Choosing the window — batch up to one, never review dribs

A run's cost is set by the level, not by the size of the diff (SKILL.md), so a handful of files pays close to a full run's price for a fraction of its coverage. Reviewing each small commit as it lands is the most expensive way to use this workflow, and the small-territory trim then cuts the fan-out too, so the thin run is also a shallow one.

**Unless the ask names a specific change, don't take the working diff — pick a commit window and review everything in it.** Not a release boundary: releases here are cut whenever it suits, so a tag sits an arbitrary distance back — sometimes one commit, sometimes fifty. Walk back instead, and stop when the range is worth a run:

```bash
git log --oneline --first-parent -40 | cat -n                                # find candidates
git diff --stat HEAD~<n>..HEAD -- . ':(exclude)pnpm-lock.yaml' | tail -3     # size each one
```

Widen `<n>` until the diff clears the 50-file seam threshold below, so the run partitions by subsystem instead of lens-skimming, then stop. **Count first-parent commits, not raw ones, and don't count dependency bumps** — a wall of `chore(deps)` inflates the commit count without adding review surface, so a window that looks like 30 commits can hold three files of real work.

Prefer the last reviewed commit as the start when it is known and lands inside that window — reviewing across it re-pays for findings already dispositioned.

Past a few hundred files the reportable ceiling (`angles × perAngle + cleanupCap`) has not moved, so widening the window only samples thinner — **raise the level instead** (`xhigh` at seam scale) and let the next chunk have its own run.

Two exclusions belong in the target string, because a finder spends real attention on them otherwise:

- Lockfiles and version-only catalog churn.
- Anything already merged and reviewed upstream. An empty `git diff --stat origin/<trunk> HEAD -- <path>` proves the path shipped there — a range that spans a trunk merge otherwise re-reviews it.

`area` mode pulls the opposite way — narrow the target, don't batch it (see `area.md`), because its finders read whole files rather than hunks.

## The Find phase partitions itself by diff size — nothing to pass

Under 50 changed files the finders split by **lens** (one angle each over the whole diff), which is right while the territory is small enough that every finder reads every hunk. At 50 or more they split by **seam** — one finder per subsystem, tracing it end to end plus the boundary it hands data across — since lens-splitting a release-sized diff degenerates into parallel skims that all converge on whatever is loudest. Seam mode adds a whole-diff finder so a bad seam split cannot leave territory unread.

The chosen mode is logged and lands in `stats.findMode`; a run is not comparable to another without it. Seam mode also requires the Scope agent to have returned a usable partition — one seam is not a partition, so a thin answer falls back to lens rather than reviewing a 500-file diff through a split nobody checked.

## Always an independent second pass over the whole PR

This workflow is a **separate, independent checker that runs in addition to CodeRabbit, never instead of it** — the whole point is redundant coverage so what one reviewer misses the other catches. CodeRabbit reviews incrementally (only new commits per push) and routinely misses findings; this workflow re-derives findings from scratch with its own finders and independent verifiers.

So when the ask is "review the PR" (not just "review my last change"), target the **entire PR diff** (`target` = the PR number), not only the newest commit — re-check every file in the PR, including ones CodeRabbit already saw and ones an earlier local review already passed. Scoping the second pass to just the new changes defeats the redundancy. Run it after CodeRabbit has finished (check its state per the `coderabbit` skill) so both passes are complete before the PR is considered reviewed.

## Reporting

Standard table (see SKILL.md). Findings are `correctness` or `cleanup`; `stale-record` appears as a provenance label rather than a finding kind, because a diff review only notices a stale doc when the change happens to walk past it. Auditing the record properly is what `area` mode is for.
