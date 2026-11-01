# Bosses

Bosses are the enemies whose reward is claimed rather than dropped, so their rules are a service of their own rather than the enemies' drops. Three rules are built as pure services in `genshin-world`: when a normal boss comes back after its Trounce Blossom's claim, whether an unclaimed normal boss is still held down by the teleports into its area, and where a week's weekly-boss claims are counted from (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`, `packages/genshin-world/src/services/bosses/checkIsBossHeld.ts`, `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`). The world reads all three now: the [enemies](../enemies/design.md)' respawn check gives a normal boss its claimed time, or releases an unclaimed one at the teleport out of its area (`packages/genshin-world/src/services/enemy/checkIsEnemyRespawned.ts`), and the claim composable reads the weekly claims that the price, built on the [Original Resin](../original-resin/design.md) page, is counted from (`packages/genshin-world/src/composables/useWorldTrounceBlossoms.ts`). The rules are the [proposal](../../../changes/genshin-bosses/design.md)'s, read off the wiki.

## How it works

```mermaid
flowchart TD
  D["A normal boss defeated"] --> C{"Its Trounce Blossom claimed?"}
  C -->|"no"| S["Stays defeated until a teleport lands outside its area"]
  C -->|"yes, at a time"| R["Back the respawn span after the claim"]
```

## Decisions

- **An unclaimed boss has no respawn time.** `computeBossRespawnTime` returns undefined for a boss with no claim, since `checkIsBossHeld` holds it until a teleport lands outside its area, which the world will take as the claim's absence (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`).
- **A teleport out of a boss's area is one whose landing lies outside it.** The teleport event names only the jump's pose, so the landing decides: each landing is kept as the last one into the area it falls in, the landing outside every area under the empty id, and a held boss is released once another area's entry holds a landing after its defeat. A walk out of the area followed by a teleport from beyond it releases the boss as well, since only the landing is read (`packages/genshin-world/src/services/bosses/checkIsBossHeld.ts`, `packages/genshin-world/src/composables/useWorldTrounceBlossoms.ts`).
- **A claimed boss is back a fixed span later.** `BOSS_RESPAWN_AFTER_CLAIM_DURATION` holds the five seconds the wiki's Normal Bosses page gives, a figure that page is not in the cache to settle (see Open), and a claim at any time brings the boss back that span after it. The span's value lives in `packages/genshin-world/src/services/bosses/constants.ts`, and the return is `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`.
- **The week resets on Monday at 04:00 on the server's clock.** `computeLastWeeklyReset`, in the [reset clock](../reset-clock/design.md), finds the most recent Monday at the server's 04:00 at or before the moment read; `packages/genshin-world/src/services/time/constants.ts` names its zone `GAME_TIME_ZONE`, `Asia/Shanghai`. A moment before that week's reset belongs to the week before. The Monday 04:00 is the weekly refresh row "REFRESH_WEEKlY", id 800001, `14400;360000`, in `{data-root}/genshin-parity/text/ExcelBinOutput/RefreshPolicyExcelConfigData.json` (14400 is the 4:00 hour, and 360000 seconds past the epoch's Thursday is Monday 04:00); the function is `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts`.
- **A claim at the reset counts toward the new week.** `countWeeklyClaims` counts a claim made at or after the reset and no later than the moment read, so the claim at exactly 04:00 Monday is this week's first and a claim after the moment is not yet counted (`packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).
- **One count across every weekly boss.** `countWeeklyClaims` counts the claims of all weekly bosses together, since the cheap price is for the first three claims in the week, whichever boss they are for (`packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).
- **The prices are the constants'.** The wiki's Weekly Bosses page, named in Sources, would give the same two prices, but it is not in the cache, so the prices are open (see Open). The code's constants hold them (`packages/genshin-world/src/services/originalResin/constants.ts`), and the export's discount row gives three claims at 0.5 ("CONST_VALUE_WEEKLY_BOSS_RESIN_DISCOUNT_PARAM" in `{data-root}/genshin-parity/text/ExcelBinOutput/ConstValueExcelConfigData.json`).

## Scope and order

**Built:** the respawn rule after a claim, the hold on an unclaimed boss, and the weekly reset and count, as pure services with tests (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` with its `.test.ts`, `packages/genshin-world/src/services/bosses/checkIsBossHeld.ts` with its `.test.ts`, `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts` with its `.test.ts`, and `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts` with its `.test.ts`).

Not built, and in the [proposal](../../../changes/genshin-bosses/design.md): the Trounce Blossom's offer and claim, which wait on the enemies' defeat map and the interaction prompts; the bosses' rewards, which need the reward table fetched since the dump's blossom tables hold no normal boss's row (`{data-root}/genshin-parity/text/ExcelBinOutput/BlossomRefreshExcelConfigData.json`, whose rows name no boss refresh type); each boss's moves, phases and shields; the weekly bosses' domains and quests; and the handbook's quick challenge rewards.

## Key files

| File                                                                   | Role                                                                                                    |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/bosses/constants.ts`              | The five-second respawn after a claim                                                                   |
| `packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts` | A claimed boss's time back, and none while it is unclaimed                                              |
| `packages/genshin-world/src/services/time/computeLastWeeklyReset.ts`   | The Monday 04:00 server reset at or before a moment                                                     |
| `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`      | The claims made since the week's reset, the count that prices the next claim                            |
| `packages/genshin-world/src/services/enemy/computeEnemyRespawnTime.ts` | A normal boss back five seconds after its claim, and no time while it is unclaimed                      |
| `packages/genshin-world/src/services/bosses/checkIsBossHeld.ts`        | Whether an unclaimed boss is still held, by the teleports that landed outside its area after its defeat |

## Sources

- [Normal Bosses](https://genshin-impact.fandom.com/wiki/Normal_Bosses), Genshin Impact Wiki: the Trounce Blossom's claim, and the respawn five seconds after a claim or only on teleporting away.
- [Weekly Bosses](https://genshin-impact.fandom.com/wiki/Weekly_Bosses), Genshin Impact Wiki: the weekly claims and their prices.
- [Domains](https://genshin-impact.fandom.com/wiki/Domains), Genshin Impact Wiki: a weekly reward once a week, 30 resin for the first three and 60 after, refreshed at the weekly reset.
- The weekly reset on Monday at 04:00, as the [reset clock](../reset-clock/design.md) gives it.
- `{data-root}/genshin-parity/text/ExcelBinOutput/RefreshPolicyExcelConfigData.json`, id 800001, `14400;360000`, for Monday 04:00, grounding "The weekly reset falls on Monday at 04:00".
- The export's weekly discount row, `{data-root}/genshin-parity/text/ExcelBinOutput/ConstValueExcelConfigData.json` "CONST_VALUE_WEEKLY_BOSS_RESIN_DISCOUNT_PARAM", gives three claims at 0.5, grounding "The first three weekly claims of a week are priced at 30 resin" and "Later weekly claims of a week are priced at 60 resin".

## Open

The open items are the spec's, in its [Open list](spec.md), so none is repeated here.
