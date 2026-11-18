import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";
import type { readCraftingRecipes as readCraftingRecipesFn } from "#src/services/crafting/readCraftingRecipes";
import type { readCraftingStrongboxes as readCraftingStrongboxesFn } from "#src/services/crafting/readCraftingStrongboxes";
import type { readDomainChallengeLevels as readDomainChallengeLevelsFn } from "#src/services/domains/readDomainChallengeLevels";
import type { readCookingTalents as readCookingTalentsFn } from "#src/services/cooking/readCookingTalents";
import type { readDishes as readDishesFn } from "#src/services/cooking/readDishes";
import type { readForgeRecipes as readForgeRecipesFn } from "#src/services/forging/readForgeRecipes";
import type { readHomeBlueprints as readHomeBlueprintsFn } from "#src/services/home/readHomeBlueprints";
import type { readProcessingRecipes as readProcessingRecipesFn } from "#src/services/cooking/readProcessingRecipes";
import type { readPaimonsBargainsRotation as readPaimonsBargainsRotationFn } from "#src/services/shop/readPaimonsBargainsRotation";
import type { readCharacterTrials as readCharacterTrialsFn } from "#src/services/trial/readCharacterTrials";
import type { readShopGoodMap as readShopGoodMapFn } from "#src/services/shop/readShopGoodMap";
import type { readWishSchedule as readWishScheduleFn } from "#src/services/wish/readWishSchedule";

import { useWorldScreenRecords } from "#src/composables/useWorldScreenRecords";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { readDomainChallengeLevels } from "#src/services/domains/readDomainChallengeLevels";
import { readCookingTalents } from "#src/services/cooking/readCookingTalents";
import { readDishes } from "#src/services/cooking/readDishes";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { readHomeBlueprints } from "#src/services/home/readHomeBlueprints";
import { readProcessingRecipes } from "#src/services/cooking/readProcessingRecipes";
import { readPaimonsBargainsRotation } from "#src/services/shop/readPaimonsBargainsRotation";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { readShopGoodMap } from "#src/services/shop/readShopGoodMap";
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
vi.mock(import("#src/services/domains/readDomainChallengeLevels"), () => ({
  readDomainChallengeLevels: vi.fn<typeof readDomainChallengeLevelsFn>(() => Promise.resolve({})),
}));
vi.mock(import("#src/services/cooking/readCookingTalents"), () => ({
  readCookingTalents: vi.fn<typeof readCookingTalentsFn>(() => Promise.resolve({})),
}));
vi.mock(import("#src/services/cooking/readDishes"), () => ({
  readDishes: vi.fn<typeof readDishesFn>(() => Promise.resolve({})),
}));
vi.mock(import("#src/services/forging/readForgeRecipes"), () => ({
  readForgeRecipes: vi.fn<typeof readForgeRecipesFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/cooking/readProcessingRecipes"), () => ({
  readProcessingRecipes: vi.fn<typeof readProcessingRecipesFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/home/readHomeBlueprints"), () => ({
  readHomeBlueprints: vi.fn<typeof readHomeBlueprintsFn>(() => Promise.resolve([])),
}));
vi.mock(import("#src/services/shop/readPaimonsBargainsRotation"), () => ({
  readPaimonsBargainsRotation: vi.fn<typeof readPaimonsBargainsRotationFn>(),
}));
vi.mock(import("#src/services/shop/readShopGoodMap"), () => ({
  readShopGoodMap: vi.fn<typeof readShopGoodMapFn>(() => Promise.resolve(new Map())),
}));
vi.mock(import("#src/services/trial/readCharacterTrials"), () => ({
  readCharacterTrials: vi.fn<typeof readCharacterTrialsFn>(() =>
    Promise.resolve({ avatars: {}, builds: {}, reliquaries: {}, rewards: {}, stages: {}, templates: [] }),
  ),
}));
vi.mock(import("#src/services/wish/readWishSchedule"), () => ({
  readWishSchedule: vi.fn<typeof readWishScheduleFn>(() => Promise.resolve([])),
}));

describe(useWorldScreenRecords, () => {
  const gameDataBaseUrl = "http://a.test";
  // The recipes the crafting screen and the bag both read, held as the one array the reader resolved
  const recipes: CraftingRecipe[] = [];
  // A rotation with nothing in it, which the test only needs the read of
  const rotation: PaimonsBargainsRotation = {
    blackcliffWeaponIds: [],
    characterGoodIds: [],
    characterPairs: [],
    characterPrice: { buyLimit: 1, costs: [], refresh: ShopRefresh.Monthly },
    royalWeaponIds: [],
    weaponGoodIds: [],
    weaponPrice: { buyLimit: 1, costs: [], refresh: ShopRefresh.Monthly },
  };

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

  test("reads the dishes as the bag opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Inventory;
    await nextTick();
    await flushReads();

    expect(readDishes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the blacksmith's recipes as the forge opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Forge;
    await nextTick();
    await flushReads();

    expect(readForgeRecipes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the cooks' talents as the cooking screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Cooking;
    await nextTick();
    await flushReads();

    expect(readCookingTalents).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the processings as the processing screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Processing;
    await nextTick();
    await flushReads();

    expect(readProcessingRecipes).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the wish schedule and the character trials as the wish screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Wish;
    await nextTick();
    await flushReads();

    expect(readWishSchedule).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
    expect(readCharacterTrials).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the shop goods as a shop opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Shop;
    await nextTick();
    await flushReads();

    expect(readShopGoodMap).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads Paimon's Bargains' rotation as its screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    vi.mocked(readPaimonsBargainsRotation).mockResolvedValueOnce(rotation);
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.PaimonsBargains;
    await nextTick();
    await flushReads();

    expect(readPaimonsBargainsRotation).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
  });

  test("reads the domains' challenge levels as the domain screen opens", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    useWorldScreenRecords({ gameDataBaseUrl });
    const worldScreenStore = useWorldScreenStore();
    worldScreenStore.screenKind = ScreenKind.Domain;
    await nextTick();
    await flushReads();

    expect(readDomainChallengeLevels).toHaveBeenCalledExactlyOnceWith(gameDataBaseUrl);
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
