---
title: Docs cleanup
description: The pages the remaining phases supersede, and the audit recipe for prose left over from the workspace layout change.
model: claude-opus-5-5
---

# Docs Cleanup

Documentation moves with the code that changes it, so none of this is a pass scheduled after the migration — each item belongs to the phase that makes it true. What this page owns is the accounting, because the migration touches pages that no test can catch going stale: the structural half of the content tree is enforced (links resolve, indexes link their neighbours, diagrams parse, Key Files paths exist), and **a stale command name or a reversed argument in prose fails nothing**.

## Pages rewritten rather than deleted

**`architecture/monorepo-tooling`** takes the largest edit. It owns the workspace layout, recursive orchestration, publishing, installs and the CI job shape, and the migration changes three of those five while leaving the layout and publishing exactly as they are. Its CI job shape already describes the traced cache, with the rejected task-runner page's surviving reasoning — one cache deciding staleness, not three — carried into it. The parts still to move:

- The virrun routing rules and the reasoning about which commands belong in the sandbox — deleted with virrun, not reworded.
- The `pnpm -r` command examples — respelled, with every rule around them intact. The rule that `--parallel` is never used for `build` is about the dependency graph and survives any runner; so does the guidance that a filter is used only where it says something a path cannot.

The section that must **not** be touched is the workspace layout. Two product roots split by "does anything import it" is a live rule stated in the present tense, and it is what makes every filter in the repository address a set rather than enumerate members. Vite+ happens to recommend the same shape, which is a convergence rather than a dependency — the rule would be identical if Vite+ did not exist.

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

The skills are not documentation in the sense this page has been using — they are what agents read instead of the docs — but they name commands, and every renamed command is a rule stated wrongly. The ones that name a script by its current spelling are the package-scripts skill, which owns script conventions outright, the running-checks skill, which names the checks a session runs and the ones CI runs, and the agent guide's command list. None of them changes meaning — every check keeps its tool and its version — so the edit is a respelling wherever the `virrun --` prefix or a cached-task invocation shows through.

The repository's standard is that a shipped convention updates its owning skill in the same change and never later, so each of those belongs to the phase that changes the command rather than to a cleanup at the end.

## Key files

| File                                                     | Role after the change                     |
| -------------------------------------------------------- | ----------------------------------------- |
| `apps/web/content/docs/architecture/monorepo-tooling.md` | rewritten to `vp` as the entry point      |
| `apps/web/content/docs/virrun/index.md`                  | the virrun area, retired with the package |
| `.agents/skills/package-scripts/SKILL.md`                | the skill rewritten in the same change    |
