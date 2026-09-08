---
title: Docs cleanup
description: The pages this migration supersedes, the reversed rejection that has to be inverted rather than deleted, and the audit recipe for prose left over from the workspace layout change.
---

# Docs Cleanup

Documentation moves with the code that changes it, so none of this is a pass scheduled after the migration — each item belongs to the phase that makes it true. What this page owns is the accounting, because the migration touches pages that no test can catch going stale: the structural half of the content tree is enforced (links resolve, indexes link their neighbours, diagrams parse, Key Files paths exist), and **a stale command name or a reversed argument in prose fails nothing**.

## The rejection that reverses

`architecture/rejected/monorepo-task-runners` rejects Turborepo-style per-package cache keys, and this proposal adopts a task runner. That looks like a straight contradiction and is not quite one, which is why the page cannot simply be deleted and replaced with the opposite.

Its reasoning holds in every particular:

- The package build is a small fraction of the run and gates nothing, so per-package granularity returns little. **Still true**, and this proposal does not claim otherwise — the win is traced inputs, not granularity.
- A third content-hash cache beside virrun's and the CI key would be a third notion of staleness, and three that disagree fail toward serving stale output. **Still true, and now the argument for the swap**: `vp run --cache` does not add a third, it subsumes two.
- A local task cache is worth little in CI without remote caching. **Still true**, and Vite+ has no remote cache in the beta, so the CI value comes from the key being right rather than from the cache being shared.

So the page is not wrong; its conclusion was correct against the tool set that existed when it was written, and one input changed. When the migration ships, that page is deleted and its surviving reasoning is inverted into the as-built page in the present tense — the standard for a tombstone is that the rule and the _why_ survive while the past tense and the dead identifier go. The sentence worth keeping is the one about competing notions of staleness, because it is what makes the new arrangement defensible rather than merely newer.

Its revisit trigger already anticipated part of this: it says granularity earns its keep once the package build stops being a small fraction of the run, and that the first step is still not a task runner. That prediction is untouched. What it did not anticipate is a runner arriving that removes caches rather than adding one.

## Pages rewritten rather than deleted

**`architecture/monorepo-tooling`** takes the largest edit. It owns the workspace layout, recursive orchestration, publishing, installs and the CI job shape, and the migration changes three of those five while leaving the layout and publishing exactly as they are. The parts that move:

- The virrun routing rules and the reasoning about which commands belong in the sandbox — deleted with virrun, not reworded.
- The paragraph explaining that the cache key is deliberately whole-set and pointing at the rejected page — replaced by the traced-input mechanism, which is a different fact rather than a revised one.
- The `pnpm -r` command examples — respelled, with every rule around them intact. The rule that `--parallel` is never used for `build` is about the dependency graph and survives any runner; so does the guidance that a filter is used only where it says something a path cannot.

The section that must **not** be touched is the workspace layout. Two product roots split by "does anything import it" is a live rule stated in the present tense, and it is what makes every filter in the repository address a set rather than enumerate members. Vite+ happens to recommend the same shape, which is a convergence rather than a dependency — the rule would be identical if Vite+ did not exist.

**`architecture/build-pipeline`** names the `package-builds` artifact, so it inherits whatever the first phase concludes. It needs re-reading against the traced-input model rather than editing in place, because a page whose opening still argues the enumerate-and-subtract policy while its body describes tracing is worse than either version alone. The application-level caching page is not in scope and should not be swept into this by its name — it owns the cached-read primitive and tag invalidation, which this migration does not touch.

## The proposal this replaces

The earlier single page under this path argued that the layout convention was worth taking from Vite+ immediately and the toolchain was not, pending a stable release and a first-class Nuxt story. Its layout half has shipped and is now stated as a rule in the architecture tree; its toolchain half is what this folder supersedes. It is deleted rather than kept, and the index entry pointing at it is repointed at this index — the route is unchanged, so nothing else moves.

That page is also the clearest instance of the pattern the audit below is aimed at: **a shipped proposal leaves prose that argues for a decision instead of stating it.** The layout is not a proposal any more, and a page that reads as though it might be re-litigated invites exactly that.

## Auditing what the layout change left behind

The workspace layout change was a one-time migration, so by the repository's own standard it has no as-built feature page — the trace is a shipped-log line and nothing else. What it can leave behind is prose written while it was still in flight: a page justifying the split rather than using it, a sentence in the past tense naming the structure that preceded it, or a diagram whose edge label names a path that no longer exists.

The recipe, in order, because the cheap checks eliminate most candidates:

1. Grep the hand-written trees — the docs content tree, the skills, the ledgers and the READMEs — for the pre-migration path spellings and for the phrases that only appear when a change is being argued rather than described.
2. For each hit, decide which of three things it is: a **live rule stated as history**, which gets inverted into the present tense with its reasoning intact; a **dead identifier**, which is deleted outright; or **correct present-tense prose**, which is left alone.
3. Re-read the frontmatter and opening of every page edited, because a revision that changes a page's substance routinely leaves its description arguing the version it replaced.

Step 2 is where this goes wrong if it is rushed. The majority of stale passages in this repository are not dead weight — they are live rules carrying their own justification in the past tense, and deleting the sentence takes the reasoning with it. That is why those passages survive pass after pass and get re-added by someone who rediscovers the reason: the deletion was lossy, so the loss got repaired.

This audit has not been run. It is scoped here as a recipe rather than as a list of pages, because an unverified list would be the same category of unchecked prose the audit exists to remove.

## The virrun area

If the retirement decision lands, an entire documentation area is deleted along with the package — its index, its per-subsystem pages, its roadmap and its deferred and rejected folders. Two consequences that are easy to miss:

- The area's entry in the proposals index's roadmap list goes with it, and so does its sidebar grouping.
- The **prior art** page is the one with content that outlives the package. It surveys the landscape and records what was adopted, studied or ruled out, and some of those findings are about caching in general rather than about virrun. Anything in it that this repository still relies on gets inverted into wherever the surviving mechanism is documented, on the same rule as the reversed rejection above.

## Skills, in the same change

The skills are not documentation in the sense this page has been using — they are what agents read instead of the docs — but they name commands, and every renamed command is a rule stated wrongly. The ones that name a script by its current spelling are the package-scripts skill, which owns script conventions outright, the context-efficiency skill's rule about batching the checks at the end of a change, and the agent guide's finishing ritual, which names four steps that partly become one.

The repository's standard is that a shipped convention updates its owning skill in the same change and never later, so each of those belongs to the phase that changes the command rather than to a cleanup at the end.
