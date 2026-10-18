# Achievement Rarity

Every card in the gallery at `/achievements` shows the share of registered users who have unlocked that achievement, as Steam's global achievement percentages do. An achievement under the rare threshold carries a **Rare** mark, and the gallery's sort control switches from category order to rarest first.

## How it works

`achievement.readAchievementRarities` counts registered users once, then runs one `GROUP BY` over the unlocked rows of `userAchievements`, joined to `achievements` for the name. Each definition's percentage is its unlock count over the user count, so every achievement is keyed in the result, and one nobody has earned reads `0`. There is no stored counter: the count runs on each page view, and an unlock never has to keep one in step.

- **Denominator** — every registered user, not the users of the product an achievement belongs to. A per-product share would need a notion of "has used the clicker" that the schema does not keep.
- **Hidden achievements** show their rarity too, as Steam does. It says how hard an achievement is without saying what it is.
- **Threshold** — `RARE_ACHIEVEMENT_THRESHOLD` in `app/services/achievement/constants.ts`, a percentage below which the card is marked Rare.
- **Sort** — the gallery's sort control is _Category_ (the default) or _Rarest first_. Rarest first sorts the definitions on the read's percentage and keeps the category order until the read lands.
- **Leaderboard** — unchanged. Points already weight hard achievements, and rarity is a per-achievement fact.
- **Toast** — no rarity. The toast fires inside the mutation that unlocked it, and a count there would put an aggregate on every trigger.

## Procedures

| Procedure                             | Auth         | Input | Purpose                                                    |
| ------------------------------------- | ------------ | ----- | ---------------------------------------------------------- |
| `achievement.readAchievementRarities` | rate-limited | —     | the percentage of users who have unlocked each achievement |

## Key files

Paths relative to `apps/web`.

| File                                               | Role                                                  |
| -------------------------------------------------- | ----------------------------------------------------- |
| `server/trpc/routers/achievement.ts`               | `readAchievementRarities` procedure                   |
| `app/services/achievement/constants.ts`            | `RARE_ACHIEVEMENT_THRESHOLD`                          |
| `app/models/achievement/AchievementSort.ts`        | the Category / Rarest first sort                      |
| `app/services/achievement/AchievementSortItems.ts` | the sort control's items                              |
| `app/components/Achievement/List.vue`              | the rarity read, the sort control and the sorted list |
| `app/components/Achievement/Grid.vue`              | passes each achievement's rarity to its card          |
| `app/components/Achievement/GridItem.vue`          | the percentage and the Rare mark on the card          |

## Sources

- [Steamworks — Stats and achievements](https://partner.steamgames.com/doc/features/achievements) — global achievement statistics: the percentage of a game's players with each achievement, ordered common to rarest, and hidden achievements kept off a profile until earned.
