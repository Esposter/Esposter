# Bosses

Bosses are the enemies whose reward is claimed rather than dropped, so their rules are a service of their own rather than the enemies' drops. Two rules are built as pure services in `genshin-world`: when a normal boss comes back after its Trounce Blossom's claim, and where a week's weekly-boss claims are counted from. The world does not call them yet, so the [enemies](../enemies/design.md) still bring a boss back at once and the claim's price, built on the [Original Resin](../original-resin/design.md) page, has no claim to price yet. The rules are the [proposal](../../../changes/genshin-bosses/design.md)'s, read off the wiki.

## How it works

```mermaid
flowchart TD
  D["A normal boss defeated"] --> C{"Its Trounce Blossom claimed?"}
  C -->|"no"| S["Stays defeated until the player teleports away"]
  C -->|"yes, at a time"| R["Back five seconds after the claim"]
  W["Each weekly-boss claim, at a time"] --> N["Counted from the week's reset: Monday 04:00 in the reader's zone"]
  N --> P["Priced by computeBlossomClaimResin: 30 for the first three, 60 after"]
```

## Decisions

- **An unclaimed boss has no respawn time.** `computeBossRespawnTime` returns undefined for a boss with no claim, since it stays defeated until the player teleports away, which the world will take as the claim's absence.
- **A claimed boss is back five seconds later.** `BOSS_RESPAWN_AFTER_CLAIM_DURATION` is the wiki's figure, and a claim at any time brings the boss back that many seconds after it.
- **The week resets on Monday at the daily reset's hour.** `computeWeeklyResetTime` finds the most recent Monday at 04:00 at or before the moment read, in that moment's own time zone, sharing `DAILY_RESET_TIME` with the enemies' reset so the hour is kept in one place. A moment before that week's reset belongs to the week before.
- **A claim at the reset counts toward the new week.** `countWeeklyClaims` counts a claim made at or after the reset and no later than the moment read, so the claim at exactly 04:00 Monday is this week's first and a claim after the moment is not yet counted.
- **One count across every weekly boss.** `countWeeklyClaims` counts the claims of all weekly bosses together, since the cheap price is for the first three claims in the week, whichever boss they are for.

## Scope and order

**Built:** the respawn rule after a claim and the weekly reset and count, as pure services with tests.

Not built, and in the [proposal](../../../changes/genshin-bosses/design.md): the Trounce Blossom's offer and claim, which wait on the enemies' defeat map and the interaction prompts; the bosses' rewards, which need the reward table fetched since the dump's blossom tables hold no normal boss's row; each boss's moves, phases and shields; the weekly bosses' domains and quests; and the handbook's quick challenge rewards.

## Key files

| File                                                                   | Role                                                                         |
| :--------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/bosses/constants.ts`              | The five-second respawn after a claim                                        |
| `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` | A claimed boss's time back, and none while it is unclaimed                   |
| `packages/genshin-world/src/services/weekly/computeWeeklyResetTime.ts` | The Monday 04:00 reset at or before a moment, in the moment's zone           |
| `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`      | The claims made since the week's reset, the count that prices the next claim |
| `packages/genshin-world/src/services/enemy/computeEnemyRespawnTime.ts` | Still brings a boss back at once until the claim is wired to the defeat map  |

## Sources

- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses), Genshin Impact Wiki: the Trounce Blossom's claim, and the respawn five seconds after a claim or only on teleporting away.
- [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: the weekly claims and their prices.
- [Domains](https://genshin-impact.fandom.com/wiki/Domains), Genshin Impact Wiki: a weekly reward once a week, 30 resin for the first three and 60 after, refreshed at the weekly reset.
- [Daily Reset](https://genshin-impact.fandom.com/wiki/Daily_Reset), Genshin Impact Wiki: the weekly reset on Monday at 04:00.
