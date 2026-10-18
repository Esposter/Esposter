import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { computeForgeRefusalLabel } from "#src/services/forging/computeForgeRefusalLabel";
import { FORGE_DAILY_POINT_CAP, FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { computeGameDay } from "#src/services/time/computeGameDay";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeForgeRefusalLabel, () => {
  const now = Temporal.Instant.fromEpochMilliseconds(0);
  const gameDay = computeGameDay(now);
  const RECIPE_FORGE_POINT = 10;
  const recipe: ForgeRecipe = {
    forgePoint: RECIPE_FORGE_POINT,
    forgeType: FORGE_ENHANCEMENT_TYPE,
    id: 11_001,
    kind: ForgeRecipeKind.Enhancement,
    materials: [],
    mora: 0,
    playerLevel: 1,
    queueSize: 1,
    results: [{ count: 1, itemId: 104_011, weight: 1 }],
    seconds: 3,
    unlockItemIds: [],
  };

  test("an order past the daily cap shows the refusal words", () => {
    expect.hasAssertions();

    const progress: ForgeProgress = {
      forgedPoints: FORGE_DAILY_POINT_CAP,
      forgedPointsDay: gameDay,
      learnedRecipeIds: [],
      orders: [],
    };

    expect(computeForgeRefusalLabel(recipe, 1, progress, now, ENGLISH_GAME_TEXT)).toBe(
      ENGLISH_GAME_TEXT[GameTextKey.ForgeEnhancementOreRefusal],
    );
  });

  test("an order under the daily cap shows no words", () => {
    expect.hasAssertions();

    const progress: ForgeProgress = { forgedPoints: 0, forgedPointsDay: gameDay, learnedRecipeIds: [], orders: [] };

    expect(computeForgeRefusalLabel(recipe, 1, progress, now, ENGLISH_GAME_TEXT)).toBe("");
  });
});
