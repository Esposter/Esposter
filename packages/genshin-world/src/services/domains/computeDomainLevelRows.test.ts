import { DomainKind } from "#src/models/domains/DomainKind";
import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { computeDomainLevelRows } from "#src/services/domains/computeDomainLevelRows";
import { describe, expect, test } from "vitest";

const CHALLENGE_LEVEL = { defeatTarget: 1, timeLimitSeconds: 360, waves: [[{ count: 1, name: "Pyro Slime" }]] };

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
            {
              dungeonId: 1,
              enemyLevel: 60,
              recommendedRank: 20,
              resinCost: 20,
              scheduledDaysOfWeek: [1, 4],
              treeRewards: [],
            },
            {
              dungeonId: 2,
              enemyLevel: 70,
              recommendedRank: 35,
              resinCost: 20,
              scheduledDaysOfWeek: [1, 4],
              treeRewards: [],
            },
            {
              dungeonId: 3,
              enemyLevel: 60,
              recommendedRank: 20,
              resinCost: 20,
              scheduledDaysOfWeek: [2, 5],
              treeRewards: [],
            },
          ],
        },
        { 20: CHALLENGE_LEVEL, 35: CHALLENGE_LEVEL },
        ADVENTURE_RANK,
        monday,
      ),
    ).toStrictEqual([
      { dungeonId: 1, enemyLevel: 60, requiredRank: 20, state: DomainLevelState.Open },
      { dungeonId: 2, enemyLevel: 70, requiredRank: 35, state: DomainLevelState.RankRequired },
      { dungeonId: 3, enemyLevel: 60, requiredRank: 20, state: DomainLevelState.Closed },
    ]);
  });

  test("closes a level with no challenge data whatever its rank and day", () => {
    expect.hasAssertions();

    expect(
      computeDomainLevelRows(
        {
          kind: DomainKind.Blessing,
          levels: [
            {
              dungeonId: 4,
              enemyLevel: 60,
              recommendedRank: 45,
              resinCost: 20,
              scheduledDaysOfWeek: [],
              treeRewards: [],
            },
          ],
        },
        {},
        ADVENTURE_RANK,
        monday,
      ),
    ).toStrictEqual([{ dungeonId: 4, enemyLevel: 60, requiredRank: 45, state: DomainLevelState.Closed }]);
  });
});
