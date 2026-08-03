# diff mode — reviewing a change

The default. Anchored on a change: working tree, branch, or PR. The change bounds the review, so the run terminates naturally when the diff is exhausted.

```javascript
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "<level> [target]" });
Workflow({ scriptPath: "<repo>/.claude/workflows/code-review.js", args: "diff <level> [target]" });
```

`diff` is implied when the first word is not a mode name, so both forms are the same run. `target` is optional: a PR number, branch, ref range, path, or free-form instruction (`"only review src/foo.ts"`). Omit it for the working diff.

## The Find phase partitions itself by diff size — nothing to pass

Under 50 changed files the finders split by **lens** (one angle each over the whole diff), which is right while the territory is small enough that every finder reads every hunk. At 50 or more they split by **seam** — one finder per subsystem, tracing it end to end plus the boundary it hands data across — since lens-splitting a release-sized diff degenerates into parallel skims that all converge on whatever is loudest. Seam mode adds a whole-diff finder so a bad seam split cannot leave territory unread.

The chosen mode is logged and lands in `stats.findMode`; a run is not comparable to another without it. Seam mode also requires the Scope agent to have returned a usable partition — one seam is not a partition, so a thin answer falls back to lens rather than reviewing a 500-file diff through a split nobody checked.

## Always an independent second pass over the whole PR

This workflow is a **separate, independent checker that runs in addition to CodeRabbit, never instead of it** — the whole point is redundant coverage so what one reviewer misses the other catches. CodeRabbit reviews incrementally (only new commits per push) and routinely misses findings; this workflow re-derives findings from scratch with its own finders and independent verifiers.

So when the ask is "review the PR" (not just "review my last change"), target the **entire PR diff** (`target` = the PR number), not only the newest commit — re-check every file in the PR, including ones CodeRabbit already saw and ones an earlier local review already passed. Scoping the second pass to just the new changes defeats the redundancy. Run it after CodeRabbit has finished (check its state per the `coderabbit` skill) so both passes are complete before the PR is considered reviewed.

## Reporting

Standard table (see SKILL.md). Findings are `correctness` or `cleanup`; `stale-record` appears as a provenance label rather than a finding kind, because a diff review only notices a stale doc when the change happens to walk past it. Auditing the record properly is what `area` mode is for.
