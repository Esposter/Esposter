---
name: score
description: Apply when reviewing, re-scoring, or updating SCORE.md. Esposter repository score review — the periodic SCORE.md self-audit and the README badge and the one compatibility date that move with it.
---

# Repository Score Review

`SCORE.md` at the repo root is a periodic self-audit of the repository across its areas, each with a score, terse notes, and explicitly accepted trade-offs. It is the reference for "how healthy is this repo right now", and the README badge advertises the overall number.

## What must stay in sync

Every score review updates all of these in the same commit:

1. **`SCORE.md`** — the `Nuxt compatibilityDate` mirrored in the header line, the overall total, each area score/note, and the per-area sections.
2. **`README.md`** — the `[badge-score]` shields URL (`score-<total>%2F100-<color>`). The number must equal SCORE.md's overall.
3. **`apps/web/configuration/compatibilityDate.ts`** — the one compatibility date, bumped at the review. Nuxt and the app Worker's generated wrangler configuration both read it.
4. **`apps/jobs/wrangler.jsonc` and `apps/realtime/wrangler.jsonc`** — their `compatibility_date` restates that date, since JSONC imports nothing.

## Why the compatibility date moves with the review

The repository holds one compatibility date for Nuxt and the three Workers, since no behaviour needs them apart. Nuxt's `compatibilityDate` opts into the framework behaviour as of a given date, and a Worker's `compatibility_date` does the same for the Workers runtime. Left alone it silently drifts years behind the installed Nuxt, so new defaults never activate and the eventual bump becomes a big-bang change. The score review is the natural checkpoint: it is the moment we deliberately re-read the repo, so it's the moment to advance the date, verify nothing broke, and record the new date in the SCORE.md header. Set it to the review date, check it ("Process" on this page, step 2), and if something breaks that's a finding for the review, not a reason to revert silently — fix it or note it as an accepted trade-off with the older date kept.

## Process

1. Re-audit each area against the code as it exists today — versions, workflows, and CSP/security posture all go stale. Volatile counts (test files, routers, stores) do not need re-auditing, because they are written as magnitudes rather than readings ("Writing style" on this page). Re-check one only when its _magnitude_ has plausibly moved.
2. Bump the compatibility date to today, or to the date of the installed `workerd` (the date in its version, `1.YYYYMMDD.n`, taking the oldest when the lockfile holds two) if that is earlier, since a newer date makes local dev and Miniflare fall back. Typecheck and the suite are CI's (the `running-checks` skill), so a behaviour the new date changes surfaces there, and is a finding for the review.
3. Rewrite `SCORE.md`: header line (date + compatibilityDate + overall), summary table, and the section bodies. Keep it terse — notes are one line each.
4. Update the README badge number and color.
5. Commit them together so the badge never advertises a stale number.

## Writing style

The shared writing rules are the `openspec` skill's. Three are specific to this file:

- **The scores are exact, their evidence is a magnitude.** A score is the artifact rather than a reading of the tree, so it stays precise; the counts cited to justify one are wrong within weeks, and a stale count discredits the score it was cited for. Held by `scripts/src/workspace/preciseCounts.test.ts`, which fails on a precise count of anything the repo can count — an enumeration is its own count.
- **Accepted trade-offs are first-class.** A score below maximum must say what the trade-off is and why it was accepted, not just what's missing. An area at maximum with a known compromise (e.g. `skipLibCheck`) still records it.
- **No aspiration.** SCORE.md describes the repo as it is, never as it will be. Planned work belongs in `openspec/changes/` (the `openspec` skill).
