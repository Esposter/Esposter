# Bosses

Bosses are the enemies whose reward is claimed rather than dropped, so their rules are a service of their own rather than the enemies' drops. Two rules are built as pure services in `genshin-world`: when a normal boss comes back after its Trounce Blossom's claim, and where a week's weekly-boss claims are counted from (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`, `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`). The world does not call them yet, so the [enemies](../enemies/design.md) still bring a boss back at once and the claim's price, built on the [Original Resin](../original-resin/design.md) page, has no claim to price yet. The rules are the [proposal](../../../changes/genshin-bosses/design.md)'s, read off the wiki.

## How it works

```mermaid
flowchart TD
  D["A normal boss defeated"] --> C{"Its Trounce Blossom claimed?"}
  C -->|"no"| S["Stays defeated until the player teleports away"]
  C -->|"yes, at a time"| R["Back the respawn span after the claim"]
  W["Each weekly-boss claim, at a time"] --> N["Counted from the week's reset: Monday 04:00 on the server's clock"]
  N --> P["Priced by computeBlossomClaimResin: 30 for the first three, 60 after"]
```

## Decisions

- **An unclaimed boss has no respawn time.** `computeBossRespawnTime` returns undefined for a boss with no claim, since it stays defeated until the player teleports away, which the world will take as the claim's absence (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`).
- **A claimed boss is back a fixed span later.** `BOSS_RESPAWN_AFTER_CLAIM_DURATION` is the wiki's figure, and a claim at any time brings the boss back that span after it. The span's value lives in `packages/genshin-world/src/services/bosses/constants.ts`, and the return is `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`.
- **The week resets on Monday at 04:00 on the server's clock.** `computeLastWeeklyReset`, in the [reset clock](../reset-clock/design.md), finds the most recent Monday at the server's 04:00 at or before the moment read, the one clock every reset is read on. A moment before that week's reset belongs to the week before. The Monday 04:00 is the weekly refresh row `REFRESH_WEEKlY`, id 800001, `14400;360000`, in `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/RefreshPolicyExcelConfigData.json` (14400 is the 4:00 hour, and 360000 seconds past the epoch's Thursday is Monday 04:00); the function is `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts`.
- **A claim at the reset counts toward the new week.** `countWeeklyClaims` counts a claim made at or after the reset and no later than the moment read, so the claim at exactly 04:00 Monday is this week's first and a claim after the moment is not yet counted (`packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).
- **One count across every weekly boss.** `countWeeklyClaims` counts the claims of all weekly bosses together, since the cheap price is for the first three claims in the week, whichever boss they are for (`packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).

## Scope and order

**Built:** the respawn rule after a claim and the weekly reset and count, as pure services with tests (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` with its `.test.ts`, `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts` with its `.test.ts`, and `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts` with its `.test.ts`).

Not built, and in the [proposal](../../../changes/genshin-bosses/design.md): the Trounce Blossom's offer and claim, which wait on the enemies' defeat map and the interaction prompts; the bosses' rewards, which need the reward table fetched since the dump's blossom tables hold no normal boss's row; each boss's moves, phases and shields; the weekly bosses' domains and quests; and the handbook's quick challenge rewards.

## Key files

| File                                                                   | Role                                                                         |
| :--------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/bosses/constants.ts`              | The five-second respawn after a claim                                        |
| `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` | A claimed boss's time back, and none while it is unclaimed                   |
| `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts`   | The Monday 04:00 server reset at or before a moment                          |
| `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`      | The claims made since the week's reset, the count that prices the next claim |
| `packages/genshin-world/src/services/enemy/computeEnemyRespawnTime.ts` | Still brings a boss back at once until the claim is wired to the defeat map  |

## Sources

- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses), Genshin Impact Wiki: the Trounce Blossom's claim, and the respawn five seconds after a claim or only on teleporting away.
- [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: the weekly claims and their prices.
- [Domains](https://genshin-impact.fandom.com/wiki/Domains), Genshin Impact Wiki: a weekly reward once a week, 30 resin for the first three and 60 after, refreshed at the weekly reset.
- The weekly reset on Monday at 04:00, as the [reset clock](../reset-clock/design.md) gives it.

## Open
- [ ] **A normal boss stays defeated until the player teleports away** — no source yet: the wiki's Normal Bosses page, named in Sources, is not in the wiki cache, and no file in `packages/genshin-world/src/services/bosses/` ties the defeat to a teleport; `computeBossRespawnTime.ts` gives the respawn time from the last claim alone.
- **A claimed normal boss returns five seconds after its claim** — `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` (line 6) adds `BOSS_RESPAWN_AFTER_CLAIM_DURATION`, which is five seconds (`packages/genshin-world/src/services/bosses/constants.ts`, line 4).
- **The weekly reset is read on the server's UTC+8 clock** — `packages/genshin-world/src/services/time/constants.ts` sets `GAME_TIME_ZONE` to `Asia/Shanghai`, UTC+8, and `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts` (line 6) reads the reset in that zone.
- **A weekly boss's claim costs 30 resin for the first three of a week and 60 after** — `packages/genshin-world/src/services/originalResin/constants.ts` (`WEEKLY_BOSS_CHEAP_RESIN = 30`, `WEEKLY_BOSS_CHEAP_CLAIMS = 3`, `WEEKLY_BOSS_RESIN = 60`) and `packages/genshin-world/src/services/originalResin/computeBlossomClaimResin.ts` (line 12).
- **The first three weekly claims count across every weekly boss together** — `packages/genshin-world/src/composables/useWorldTrounceBlossoms.ts` (lines 98 to 103) counts the claims of every weekly boss for the price, while `packages/genshin-world/src/services/bosses/checkIsWeeklyBossClaimable.ts` counts only a boss's own claims for its once-a-week gate.
