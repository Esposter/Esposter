import { DomainKind } from "#src/models/domains/DomainKind";
import { toWeeklyBossSchedule } from "#src/services/domains/toWeeklyBossSchedule";
import { describe, expect, test } from "vitest";

describe(toWeeklyBossSchedule, () => {
  test("a weekly boss's levels open every day and pay no Petrified Tree, its blossom paying instead", () => {
    expect.hasAssertions();

    expect(toWeeklyBossSchedule({ levels: [{ dungeonId: 1, enemyLevel: 2, recommendedRank: 3 }] })).toStrictEqual({
      kind: DomainKind.Trounce,
      levels: [
        {
          dungeonId: 1,
          enemyLevel: 2,
          recommendedRank: 3,
          resinCost: 0,
          scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7],
          treeRewards: [],
        },
      ],
    });
  });
});
