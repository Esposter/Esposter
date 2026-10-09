import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { checkIsForgeDailyCapReached } from "#src/services/forging/checkIsForgeDailyCapReached";
import { FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { describe, expect, test } from "vitest";

describe(checkIsForgeDailyCapReached, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  // The epoch's eight in the morning in the game's time zone falls on the game day that began at four the same morning
  const EPOCH_GAME_DAY = EPOCH.toZonedDateTimeISO("Asia/Shanghai").subtract({ hours: 4 }).toPlainDate();
  const recipe: ForgeRecipe = {
    forgePoint: 10_000,
    forgeType: FORGE_ENHANCEMENT_TYPE,
    id: 11_003,
    kind: ForgeRecipeKind.Enhancement,
    materials: [{ count: 4, id: 101_003 }],
    mora: 50,
    playerLevel: 5,
    queueSize: 10,
    results: [{ count: 1, itemId: 104_013, weight: 1 }],
    seconds: 180,
    unlockItemIds: [],
  };
  const progress: ForgeProgress = {
    forgedPoints: 390_000,
    forgedPointsDay: EPOCH_GAME_DAY,
    learnedRecipeIds: [],
    orders: [],
  };

  test("should allow the day's points to reach the cap exactly", () => {
    expect.hasAssertions();

    expect(checkIsForgeDailyCapReached(recipe, 1, progress, EPOCH.add({ hours: 3 }))).toBe(false);
  });

  test("should refuse a recipe that takes the day's points past the cap", () => {
    expect.hasAssertions();

    expect(checkIsForgeDailyCapReached(recipe, 2, progress, EPOCH.add({ hours: 3 }))).toBe(true);
  });

  test("should start the day's points again at the daily reset", () => {
    expect.hasAssertions();

    // Four in the morning in the game's time zone is twenty hours past the epoch's eight in the morning
    expect(checkIsForgeDailyCapReached(recipe, 2, progress, EPOCH.add({ hours: 19 }))).toBe(true);
    expect(checkIsForgeDailyCapReached(recipe, 2, progress, EPOCH.add({ hours: 20 }))).toBe(false);
  });
});
