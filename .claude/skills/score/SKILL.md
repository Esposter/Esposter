---
name: score
description: Esposter repository score review — how to re-run the SCORE.md audit, keep the README badge in sync, and bump the Nuxt compatibilityDate to the review date. Apply when reviewing, re-scoring, or updating SCORE.md.
---

# Repository Score Review

`SCORE.md` at the repo root is a periodic self-audit of the repository across nine areas, each with a score, terse notes, and explicitly accepted trade-offs. It is the reference for "how healthy is this repo right now", and the README badge advertises the overall number.

## The three things that must stay in sync

Every score review updates all three in the same commit:

1. **`SCORE.md`** — the `Last reviewed` date, the `Nuxt compatibilityDate` mirrored in the header line, the overall total, each area score/note, and the per-area sections.
2. **`README.md`** — the `[badge-score]` shields URL (`score-<total>%2F100-<color>`). The number must equal SCORE.md's overall.
3. **`packages/app/configuration/compatibilityDate.ts`** — bumped to the review date.

## Why compatibilityDate moves with the review

Nuxt's `compatibilityDate` opts into the framework behaviour as of a given date. Left alone it silently drifts years behind the installed Nuxt, so new defaults never activate and the eventual bump becomes a big-bang change. The score review is the natural checkpoint: it is the moment we deliberately re-read the repo, so it's the moment to advance the date, verify nothing broke, and record the new date in the SCORE.md header. Set it to the review date, run typecheck and tests, and if something breaks that's a finding for the review, not a reason to revert silently — fix it or note it as an accepted trade-off with the older date kept.

## Process

1. Re-audit each of the nine areas against the code as it exists today — versions, workflows, and CSP/security posture all go stale. Volatile counts (test files, routers, stores) do not need re-auditing, because they are written as magnitudes rather than readings; see the writing style below. Re-check one only when its _magnitude_ has plausibly moved.
2. Bump `compatibilityDate` to today, then run `pnpm typecheck` and `pnpm test` from `packages/app/`.
3. Rewrite `SCORE.md`: header line (date + compatibilityDate + overall), summary table, and the section bodies. Keep it terse — notes are one line each.
4. Update the README badge number and color.
5. Commit all three together so the badge never advertises a stale number.

## Writing style

Same discipline as the `docs` skill: prose over bullets, [magnitudes over precise measurements](../docs/SKILL.md), every line earns its place. The magnitude rule bites hardest here, because a score's evidence is naturally numeric: "several hundred test files" survives a year of merges, "473 test files" was wrong within a week — and a stale count discredits the score it was cited to justify. The scores themselves stay exact; they are the artifact, not evidence about the tree. Two rules are specific to this file:

- **Accepted trade-offs are first-class.** A score below maximum must say what the trade-off is and why it was accepted, not just what's missing. An area at maximum with a known compromise (e.g. `skipLibCheck`) still records it.
- **No aspiration.** SCORE.md describes the repo as it is, never as it will be. Planned work belongs in the relevant `docs/<area>/roadmap.md`.
