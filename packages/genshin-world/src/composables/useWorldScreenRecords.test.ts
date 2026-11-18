import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { readCraftingRecipes as readCraftingRecipesFn } from "#src/services/crafting/readCraftingRecipes";

import { useWorldScreenRecords } from "#src/composables/useWorldScreenRecords";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { flushReads } from "#src/services/shared/flushReads.test";
import { useWorldScreenStore } from "#src/store/screen";
import { startTestWorldSession } from "#src/store/session.fixture";
import { afterEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";

vi.mock(import("#src/services/crafting/readCraftingRecipes"), () => ({
  readCraftingRecipes: vi.fn<typeof readCraftingRecipesFn>(() => Promise.resolve([])),
}));

describe(useWorldScreenRecords, () => {
  const gameDataBaseUrl = "http://a.test";
  // The recipes the crafting screen and the bag both read, held as the one array the reader resolved
  const recipes: CraftingRecipe[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads a screen's records as the screen opens, not as the world starts", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    await flushReads();

    expect(readCraftingRecipes).not.toHaveBeenCalled();

    worldScreenStore.screenKind = ScreenKind.Crafting;
    await nextTick();
    await flushReads();

    expect(readCraftingRecipes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("holds a read record, so a screen that shares it does not read it again", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    vi.mocked(readCraftingRecipes).mockResolvedValueOnce(recipes);
    const records = useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Crafting;
    await nextTick();
    await flushReads();
    worldScreenStore.screenKind = ScreenKind.World;
    await nextTick();
    worldScreenStore.screenKind = ScreenKind.Inventory;
    await nextTick();
    await flushReads();

    expect(readCraftingRecipes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
    expect(records.craftingRecipes).toBe(recipes);
  });

  test("closes a screen whose record fails to read, and reads it again on the next open", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(readCraftingRecipes).mockRejectedValueOnce(new Error("unreadable recipes"));
    const records = useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Crafting;
    await nextTick();
    await flushReads();

    expect(worldScreenStore.screenKind).toBe(ScreenKind.World);
    expect(records.craftingRecipes).toBeUndefined();

    worldScreenStore.screenKind = ScreenKind.Crafting;
    await nextTick();
    await flushReads();

    expect(readCraftingRecipes).toHaveBeenCalledTimes(2);
    expect(records.craftingRecipes).toStrictEqual([]);
  });
});
