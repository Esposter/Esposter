import { DomainKind } from "#src/models/domains/DomainKind";
import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { describe, expect, test } from "vitest";

describe(computeDomainLevelRows, () => {
  const MONDAY_DAYS_AFTER_EPOCH = 4;
  const monday = Temporal.Instant.fromEpochMilliseconds(0)
    .toZonedDateTimeISO("UTC")
    .toPlainDate()
    .add({ days: MONDAY_DAYS_AFTER_EPOCH });
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
