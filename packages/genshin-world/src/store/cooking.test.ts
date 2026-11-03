import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { flushReads } from "#src/services/shared/flushReads.test";
import { useWorldCookingStore } from "#src/store/cooking";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

const ITEM_ID = 100;
const recipe = { unlockItemIds: [ITEM_ID] } as CookingRecipe;

vi.mock(import("#src/services/cooking/readCookingRecipes"), () => ({
  readCookingRecipes: () => Promise.resolve([recipe]),
}));
vi.mock(import("#src/services/cooking/readCookingTalents"), () => ({ readCookingTalents: () => Promise.resolve({}) }));
vi.mock(import("#src/services/cooking/readProcessingRecipes"), () => ({
  readProcessingRecipes: () => Promise.resolve([]),
}));
vi.mock(import("#src/services/cooking/readMondstadtCookingStovePlace"), () => ({
  readMondstadtCookingStovePlace: () => Promise.resolve(),
}));

describe(useWorldCookingStore, () => {
  const savedProgress = { learnedRecipeIds: [1], proficiencies: { 1: 2 } };

  const startCooking = () => {
    startTestWorldSession();
    const worldCookingStore = useWorldCookingStore();
    worldCookingStore.start({ cookingProgress: savedProgress, processingJobs: {} });
    return worldCookingStore;
  };

  test("the progress the save holds is the store's from the start, and none is left once it stops", () => {
    expect.hasAssertions();

    const worldCookingStore = startCooking();

    expect(worldCookingStore.cookingProgress).toStrictEqual(savedProgress);

    worldCookingStore.stop();

    expect(worldCookingStore.cookingProgress).toStrictEqual({ learnedRecipeIds: [], proficiencies: {} });
  });

  test("each instruction item opens the dish it teaches once the recipes are read", async () => {
    expect.hasAssertions();

    const worldCookingStore = startCooking();
    await flushReads();

    expect(worldCookingStore.instructionRecipeMap.get(ITEM_ID)).toBe(recipe);
  });
});
