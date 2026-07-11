---
title: Points leaderboard
description: Proposal — a global ranking of users by total achievement points.
---

# Points Leaderboard

A leaderboard page ranking users by the summed `points` of their unlocked achievements. Every achievement already carries a points value and unlocks live in Postgres, so this is one aggregate query plus a page — and it gives the games and products a shared competitive surface (the deferred clicker/dungeons leaderboards both point here as their trigger).

## Scope

**Today:** points exist only as per-achievement metadata shown in the gallery; nothing aggregates them.

**This adds:** a `readPointsLeaderboard` procedure (top N users + the caller's own rank) and a leaderboard section on the achievements page.

## How it works

- **Query** — join `userAchievements (unlockedAt IS NOT NULL)` to `achievements`, map names to definition points server-side (points live in the definition map, not the DB — reuse `AchievementDefinitionMap`), group by user, order by total desc, limit N (e.g. 25); a second cheap query ranks the caller (`COUNT(*) WHERE total > mine`). Rate-limited procedure; display name + avatar come from the users relation.
- **Client** — a podium/list under a tab on `/achievements` (`v-tabs`: Gallery / Leaderboard), showing rank, user, points, unlock count; highlight the caller's row and append it when outside the top N.
- Points changes only happen on unlock, so no denormalized total is needed until scale demands it — start with the aggregate, add a `points` column on users only if the query ever hurts.

## Key files

Paths relative to `packages/app`.

| File                                         | Change                |
| -------------------------------------------- | --------------------- |
| `server/trpc/routers/achievement.ts`         | leaderboard procedure |
| `app/pages/achievements.vue`                 | tabs                  |
| `app/components/Achievement/Leaderboard.vue` | ranking list          |

## Notes

- Hidden achievements count toward totals without being revealed (only names/descriptions are masked, points are public metadata) — no leak.
- Opt-out/privacy is deliberately out of scope: achievements are already readable per user via `readUserAchievements`.
