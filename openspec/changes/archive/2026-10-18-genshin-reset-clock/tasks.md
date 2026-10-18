## 1. The server clock

- [x] 1.1 Read the game day and the last daily reset off one zone and hour. Verify: `packages/genshin-world/src/services/time/computeGameDay.test.ts` and `computeLastDailyReset.test.ts` written first, the scenarios 'a moment after the day's 04:00 reset belongs to that day' and 'a reader in another zone sees the daily reset at the server's 04:00' seen failing, then passing.
- [x] 1.2 Give the next daily reset as the 04:00 a day after the last. Verify: `computeNextDailyReset.test.ts` written first and seen failing, then passing, with the scenario 'the next daily reset is the 04:00 a day after the last one'.
- [x] 1.3 Give the last and next weekly reset on Monday at 04:00. Verify: `computeLastWeeklyReset.test.ts` and `computeNextWeeklyReset.test.ts` written first and seen failing, then passing, with the scenarios 'the weekly reset falls on Monday's 04:00' and 'the next weekly reset is the Monday 04:00 after the week's reset'.
- [x] 1.4 Give the last and next monthly reset on the first at 04:00. Verify: `computeLastMonthlyReset.test.ts` and `computeNextMonthlyReset.test.ts` written first and seen failing, then passing, with the scenarios 'the monthly reset falls on the first at 04:00' and 'the next monthly reset is the first of the next month at 04:00'.

## 2. The callers read the clock

- [x] 2.1 Read the shops' refresh and Paimon's Bargains' month off the module. Verify: `packages/genshin-world/src/services/shop/computeShopRefreshTime.test.ts` updated to the server's clock, with the shop constants and the zone imported from `services/time/constants.ts`, and passing.
- [x] 2.2 Read the enemies' elite respawn, the mining outcrops' respawn and the bosses' claims off the server's clock, and delete the old copies. Verify: `services/enemy/computeEnemyRespawnTime.test.ts`, `services/leyLine/checkIsMiningOutcropStanding.test.ts` and `services/bosses/computeBossRespawnTime.test.ts` updated and passing; `computeMiningOutcropRespawn` and its test deleted.
- [x] 2.3 Read the weekly count, reputation, commissions, forging and investigations off the module. Verify: `services/weekly/countWeeklyClaims.test.ts`, `services/reputation/checkIsReputationWeeklyLimitReached.test.ts`, `services/commission/checkIsCommissionDayCurrent.test.ts`, `services/commission/computeCommissionDay.test.ts`, `services/forging/computeForgeRefusalLabel.test.ts` and `composables/useWorldCommissions.test.ts` updated and passing.
- [x] 2.4 Take the zone for the fishing day, the gathering midnight, the Imaginarium and the Moon Spire from the module. Verify: `services/shared/findLatestBegun.test.ts`, `services/spiralAbyss/findAbyssPeriodAt.test.ts`, `services/imaginarium/findImaginariumSeason.test.ts`, `services/imaginarium/getImaginariumSeasonDifficulties.test.ts` and `services/spiralAbyss/getAbyssChamberBlessing.test.ts` updated and passing.

## 3. The specs

- [x] 3.1 State the bosses' weekly reset on the server's clock. Verify: the bosses delta is archived, and `pnpm -C scripts exec vitest run src/services/openspec` passes with the scenario checks.
- [x] 3.2 State the enemies' elite respawn on the server's clock. Verify: the enemies delta is archived, and the same suite passes.
- [x] 3.3 Fix each spec page that states another zone or hour for a reset. Verify: a grep of `openspec/specs/genshin` for "reader's own time zone" and "reader's time zone" finds no reset.
