import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldCookingStore } from "#src/store/cooking";
import { startTestWorldSession } from "#src/store/session.fixture";
import { assert, describe, expect, test, vi } from "vitest";

describe(useWorldCookingStore, () => {
  const savedProgress = { learnedRecipeIds: [1], proficiencies: { 1: 2 } };

  const startCooking = (saved = { cookingProgress: savedProgress, processingJobs: {} }) => {
    startTestWorldSession({ gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL });
    const worldCookingStore = useWorldCookingStore();
    worldCookingStore.start(saved);
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

    await vi.waitFor(() => {
      expect(worldCookingStore.cookingRecipes).not.toHaveLength(0);
    });
    const taught = worldCookingStore.cookingRecipes.find(({ unlockItemIds }) => unlockItemIds.length > 0);
    assert.exists(taught);
    const [itemId] = taught.unlockItemIds;
    assert.exists(itemId);

    expect(worldCookingStore.instructionRecipeMap.get(itemId)?.unlockItemIds).toContain(itemId);
  });
});
