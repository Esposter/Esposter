import type { Achievement } from "#src/models/achievement/Achievement";

import { checkIsAchievementCategoryComplete } from "#src/services/achievement/checkIsAchievementCategoryComplete";
import { describe, expect, test } from "vitest";

describe(checkIsAchievementCategoryComplete, () => {
  const CATEGORY_ID = 1;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const achievement: Achievement = {
    categoryId: CATEGORY_ID,
    descriptionTextId: "",
    id: 1,
    isHidden: false,
    orderId: 1,
    preStageAchievementId: 0,
    primogems: 0,
    progress: 1,
    titleTextId: "",
    trigger: { parameters: [], type: "TRIGGER_TALK_NUM" },
  };
  const otherAchievement: Achievement = { ...achievement, categoryId: CATEGORY_ID + 1, id: 2 };

  test("should be complete only once every achievement of its category is finished", () => {
    expect.hasAssertions();
    expect(checkIsAchievementCategoryComplete(CATEGORY_ID, [achievement, otherAchievement], new Map())).toBe(false);
    expect(
      checkIsAchievementCategoryComplete(
        CATEGORY_ID,
        [achievement, otherAchievement],
        new Map([[achievement.id, { count: 1, finishedAt: EPOCH }]]),
      ),
    ).toBe(true);
  });

  test("should never be complete for a category with no achievement", () => {
    expect.hasAssertions();
    expect(checkIsAchievementCategoryComplete(CATEGORY_ID, [otherAchievement], new Map())).toBe(false);
  });
});
