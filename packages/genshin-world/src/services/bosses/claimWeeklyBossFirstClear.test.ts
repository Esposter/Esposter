import { claimWeeklyBossFirstClear } from "#src/services/bosses/claimWeeklyBossFirstClear";
import { WEEKLY_BOSS_TALENT_ITEM_IDS } from "#src/services/bosses/constants";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(claimWeeklyBossFirstClear, () => {
  const HIGHEST_DIFFICULTY_ID = v7();

  test("the first clear of the highest difficulty pays one of each material", () => {
    expect.hasAssertions();

    const { clearedDomainIds, rewards } = claimWeeklyBossFirstClear(new Set(), HIGHEST_DIFFICULTY_ID);

    expect(rewards).toStrictEqual(WEEKLY_BOSS_TALENT_ITEM_IDS.map((id) => ({ count: 1, id })));
    expect(clearedDomainIds.has(HIGHEST_DIFFICULTY_ID)).toBe(true);
  });

  test("a repeat first clear of the highest difficulty pays nothing", () => {
    expect.hasAssertions();

    const { clearedDomainIds, rewards } = claimWeeklyBossFirstClear(
      new Set([HIGHEST_DIFFICULTY_ID]),
      HIGHEST_DIFFICULTY_ID,
    );

    expect(rewards).toStrictEqual([]);
    expect(clearedDomainIds.has(HIGHEST_DIFFICULTY_ID)).toBe(true);
  });
});
