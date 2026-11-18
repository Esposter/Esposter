import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { readCraftingRecipes as readCraftingRecipesFn } from "#src/services/crafting/readCraftingRecipes";
import type { readCraftingStrongboxes as readCraftingStrongboxesFn } from "#src/services/crafting/readCraftingStrongboxes";
import type { readHomeBlueprints as readHomeBlueprintsFn } from "#src/services/home/readHomeBlueprints";
import type { readWishSchedule as readWishScheduleFn } from "#src/services/wish/readWishSchedule";

import { useWorldScreenRecords } from "#src/composables/useWorldScreenRecords";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { readHomeBlueprints } from "#src/services/home/readHomeBlueprints";
import { readWishSchedule } from "#src/services/wish/readWishSchedule";
import { flushReads } from "#src/services/shared/flushReads.test";
import { useWorldScreenStore } from "#src/store/screen";
import { startTestWorldSession } from "#src/store/session.fixture";
import { afterEach, describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";

vi.mock(import("#src/services/crafting/readCraftingRecipes"), () => ({
  readCraftingRecipes: vi.fn<typeof readCraftingRecipesFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/crafting/readCraftingStrongboxes"), () => ({
  readCraftingStrongboxes: vi.fn<typeof readCraftingStrongboxesFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/home/readHomeBlueprints"), () => ({
  readHomeBlueprints: vi.fn<typeof readHomeBlueprintsFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/wish/readWishSchedule"), () => ({
  readWishSchedule: vi.fn<typeof readWishScheduleFn>(() => Promise.resolve([])),
}));

describe(useWorldScreenRecords, () => {
  const gameDataBaseUrl = "http://a.test";
  // The recipes the crafting screen and the bag both read, held as the one array the reader resolved
  const recipes: CraftingRecipe[] = [];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("reads every record a screen lists as the screen opens, not as the world starts", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    await flushReads();

    expect(readCraftingRecipes).not.toHaveBeenCalled();
    expect(readCraftingStrongboxes).not.toHaveBeenCalled();

    worldScreenStore.screenKind = ScreenKind.Crafting;
    await nextTick();
    await flushReads();

    expect(readCraftingRecipes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
    expect(readCraftingStrongboxes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
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
    expect(readHomeBlueprints).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
    expect(records.craftingRecipes).toBe(recipes);
  });

  test("reads the wish schedule as the wish screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Wish;
    await nextTick();
    await flushReads();

    expect(readWishSchedule).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
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
