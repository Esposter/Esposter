import { DomainKind } from "#src/models/domains/DomainKind";
import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/time/constants";
import { describe, expect, test } from "vitest";

describe(computeDomainLevelRows, () => {
  // The epoch fell on a Thursday in the server's zone, so the reset four days after it opens a Monday
  const DAILY_RESET = Temporal.Instant.fromEpochMilliseconds(0).subtract({ hours: GAME_DAY_START_HOUR });
  const monday = DAILY_RESET.toZonedDateTimeISO(GAME_TIME_ZONE).add({ days: 4 }).toInstant();
  const ADVENTURE_RANK = 20;

  test("marks each level open, rank required, or closed today", () => {
    expect.hasAssertions();

    expect(
      computeDomainLevelRows(
        {
          kind: DomainKind.Forgery,
          levels: [
            { dungeonId: 1, enemyLevel: 60, recommendedRank: 20, scheduledDaysOfWeek: [1, 4] },
            { dungeonId: 2, enemyLevel: 70, recommendedRank: 35, scheduledDaysOfWeek: [1, 4] },
            { dungeonId: 3, enemyLevel: 60, recommendedRank: 20, scheduledDaysOfWeek: [2, 5] },
          ],
        },
        ADVENTURE_RANK,
        monday,
      ),
    ).toStrictEqual([
      { dungeonId: 1, enemyLevel: 60, requiredRank: 20, state: DomainLevelState.Open },
      { dungeonId: 2, enemyLevel: 70, requiredRank: 35, state: DomainLevelState.RankRequired },
      { dungeonId: 3, enemyLevel: 60, requiredRank: 20, state: DomainLevelState.Closed },
    ]);
  });
});
