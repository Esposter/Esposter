# diff mode — reviewing a change

The default. Anchored on a change: working tree, branch, or PR. The change bounds the review, so the round terminates naturally when the diff is exhausted. Read this when picking the window, before reading any code.

## Choosing the window — batch up to one, never review dribs

**Unless the ask names a specific change, don't take the working diff — pick a commit window and review everything in it.** Not a release boundary: releases here are cut whenever it suits, so a tag sits an arbitrary distance back — sometimes one commit, sometimes fifty. Walk back instead:

```bash
git log --oneline --first-parent -40 | cat -n                                # find candidates
git diff --stat HEAD~<n>..HEAD -- . ':(exclude)pnpm-lock.yaml' | tail -3     # size each one
```

**Count first-parent commits, not raw ones, and don't count dependency bumps** — a wall of `chore(deps)` inflates the commit count without adding review surface, so a window that looks like 30 commits can hold three files of real work.

Prefer the last reviewed commit as the start when it is known and lands inside that window — reviewing across it re-pays for findings already dispositioned.

**The bound is what one context can read properly, not a file count.** A window whose files you can open, follow one hop out of, and construct triggers against is the right size. When the reading would have to become skimming to fit, stop the window there and give the next chunk its own round — a skim reports whatever is loudest, which is exactly the failure the trigger rule exists to catch.

Two exclusions belong in the window, because they consume real attention otherwise:

- Lockfiles and version-only catalog churn.
- Anything already merged and reviewed upstream. An empty `git diff --stat origin/<trunk> HEAD -- <path>` proves the path shipped there — a range that spans a trunk merge otherwise re-reviews it.

**`.agents/` is never one of them**, however tooling-shaped the window looks — SKILL.md, "The skill improves itself".

`area` mode pulls the opposite way — narrow the target, don't batch it (`area.md`), because there every line of a file is in scope rather than the hunks.

## Reading order for a wide diff

Small windows read front to back. Past the point where that stops being possible, order the reading so the expensive findings surface first rather than last:

1. **The seams.** Where the change hands data across a boundary — a store to a component, a router to a client, one package to another. Nearly every `critical` this repo has shipped lived at one, because each side's tests pass alone.
2. **The writes.** Mutations, migrations, optimistic updates and their rollbacks, anything with an ordering or a lock.
3. **Everything else**, front to back.

Say which order you used when the window was wide enough to need one. A round is not comparable to another without it.

## Never slice an over-cap branch by path

When a reviewer (CodeRabbit, a cloud review) refuses a diff as too large, the tempting workaround is a throwaway branch off the base holding one subsystem's files, reviewed on its own.

**It does not work, and it fails in the direction that wastes the most attention**: the slice is one tree's subsystem sitting on another tree's everything-else, so every reference crossing the cut reads as a defect. A deleted field looks un-migrated, a moved module looks missing, a composable whose consumers live in the other half looks like it broke all of them — each arrives as a confident, well-argued major finding with a step-by-step proof, and each is an artifact of the cut.

Split by **history**, not by path: stack real branches so each one's base contains everything before it, and every reference resolves against a tree that actually exists. When the caps refuse even that, the answer is a smaller PR, not a synthetic branch. A local `typecheck` settles the compile-time half of this class in one pass and costs nothing — every reference that stopped resolving across the cut — so run it against the real branch before reviewing a slice. What it cannot see is the other half: dynamic lookups, data contracts, anything only a run exercises. The suite covers those, and neither is a reason to review a synthetic tree.

## Always an independent second pass over the whole PR

This review is a **separate check that runs in addition to CodeRabbit, never instead of it** — the point is redundant coverage, so what one reviewer misses the other catches. CodeRabbit reviews incrementally (only new commits per push) and routinely misses findings.

So when the ask is "review the PR" (not just "review my last change"), read the **entire PR diff**, not only the newest commit — including files CodeRabbit already saw and ones an earlier local round already passed. Scoping the second pass to just the new changes defeats the redundancy. Run it after CodeRabbit has finished (check its state per the `coderabbit` skill) so both passes are complete before the PR is considered reviewed.

## Reporting

Standard table (`../references/reporting.md`). Correctness findings here are a defect or a broken convention; quality findings are the four lenses. `stale-record` appears as a provenance label rather than a finding kind, because a diff review only notices a stale doc when the change happens to walk past it. Auditing the record properly is what `area` mode is for.
