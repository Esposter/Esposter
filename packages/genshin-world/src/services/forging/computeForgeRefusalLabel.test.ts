import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ForgeRecipeKind } from "#src/models/forging/ForgeRecipeKind";
import { computeForgeRefusalLabel } from "#src/services/forging/computeForgeRefusalLabel";
import { FORGE_ENHANCEMENT_TYPE } from "#src/services/forging/constants";
import { readForgeDailyPointCap } from "#src/services/forging/readForgeDailyPointCap";
import { computeGameDay } from "#src/services/time/computeGameDay";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

const dailyPointCap = await readForgeDailyPointCap(GAME_DATA_LOCAL_BASE_URL);

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
      forgedPoints: dailyPointCap,
      forgedPointsDay: gameDay,
      learnedRecipeIds: [],
      orders: [],
    };

    expect(computeForgeRefusalLabel(recipe, 1, progress, now, dailyPointCap, ENGLISH_GAME_TEXT)).toBe(
      ENGLISH_GAME_TEXT[GameTextKey.ForgeEnhancementOreRefusal],
    );
  });

  test("an order under the daily cap shows no words", () => {
    expect.hasAssertions();

    const progress: ForgeProgress = { forgedPoints: 0, forgedPointsDay: gameDay, learnedRecipeIds: [], orders: [] };

    expect(computeForgeRefusalLabel(recipe, 1, progress, now, dailyPointCap, ENGLISH_GAME_TEXT)).toBe("");
  });
});
