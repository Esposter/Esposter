---
title: Achievement rarity
description: Proposal — every achievement card shows the share of Esposter users who have unlocked it, as Steam's global achievement percentages do, and the gallery can sort rarest first.
model: claude-opus-5-5
---

# Achievement Rarity

The gallery at `/achievements` shows each achievement's category, points, description, progress and unlock date ([achievements](/docs/achievement)). What it cannot say is whether an unlock is special: "First post" and a hidden clicker milestone look the same once earned. Steam's answer is the global achievement percentage — the share of a game's players who have each achievement, listed from most common to rarest — and it is the number people quote when they show an achievement off.

## What it adds

- **One grouped read.** `achievement.readAchievementRarities` returns, per achievement, the count of users with a non-null `unlockedAt` over the count of users, in one `GROUP BY achievementId` over `userAchievements` plus one `count()` over `users` — the same shape as `readPointsLeaderboard`'s aggregate, and cheap enough to run on the page's load with no stored counter to keep in step.
- **On the card**, under the points: "_n_% of users", with a **Rare** mark in the warning colour under a threshold named as a constant beside the other achievement constants. A hidden achievement a viewer has not unlocked shows its rarity too, as Steam does — it says how hard it is without saying what it is.
- **Sort.** The gallery gains a sort — _Category_ (today's grouping, the default) and _Rarest first_.
- **The leaderboard** is unchanged: points already weight hard achievements, and rarity is a per-achievement fact.

The percentage is over every registered user, not over users of the product the achievement belongs to; a per-product denominator needs a notion of "has used the clicker" the schema does not keep, and a whole-platform share is still an honest reading of rarity here.

## What is deliberately not in it

- **No stored rarity column.** A count over an indexed table on a page view is cheaper than a counter every unlock has to maintain transactionally.
- **No rarity in the unlock toast.** The toast fires inside the mutation that unlocked it; adding a count to that path puts an aggregate on every trigger.

## Key files

| File                                               | Role after the change                        |
| -------------------------------------------------- | -------------------------------------------- |
| `apps/web/server/trpc/routers/achievement.ts`      | gains `readAchievementRarities`              |
| `apps/web/app/components/Achievement/GridItem.vue` | the percentage and the Rare mark on the card |
| `apps/web/app/components/Achievement/List.vue`     | the Category / Rarest first sort             |

## Sources

- [Steamworks — Stats and achievements](https://partner.steamgames.com/doc/features/achievements) — global achievement statistics: the percentage of a game's players with each achievement, ordered common to rarest, and hidden achievements kept off a profile until earned.
