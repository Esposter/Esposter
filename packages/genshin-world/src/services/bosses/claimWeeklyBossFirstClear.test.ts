import { claimWeeklyBossFirstClear } from "#src/services/bosses/claimWeeklyBossFirstClear";
import { WEEKLY_BOSS_TALENT_ITEM_IDS } from "#src/services/bosses/constants";
import { describe, expect, test } from "vitest";

describe(claimWeeklyBossFirstClear, () => {
  const HIGHEST_DIFFICULTY_ID = "test-highest-difficulty";

  test("the first clear of the highest difficulty pays one of each material", () => {
    expect.hasAssertions();

    const { clearedDomainIds, rewards } = claimWeeklyBossFirstClear(new Set(), HIGHEST_DIFFICULTY_ID);

    expect(rewards).toStrictEqual(WEEKLY_BOSS_TALENT_ITEM_IDS.map((id) => ({ count: 1, id })));
    expect(clearedDomainIds.has(HIGHEST_DIFFICULTY_ID)).toBe(true);
  });
});
