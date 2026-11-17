import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ShopGood } from "#src/models/shop/ShopGood";

import { DishTarget } from "#src/models/cooking/DishTarget";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { createForgeProgress } from "#src/services/forging/createForgeProgress";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import {
  BLUEPRINT_DIAGRAM_ID,
  COOKING_RECIPE,
  CRAFTING_INSTRUCTION_ID,
  CRAFTING_RECIPE,
  DISH_ID,
  FORGE_DIAGRAM_ID,
  FORGE_RECIPE,
  HOME_BLUEPRINT,
  HOME_PROGRESS,
  INSTRUCTION_ITEM_ID,
} from "#src/services/inventory/constants.test";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { FRAGILE_RESIN_ITEM_ID, FRAGILE_RESIN_RESTORE } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantQuestRewards } from "#src/services/quest/grantQuestRewards";
import { buyShopGood } from "#src/services/shop/buyShopGood";
import { ItemCategory } from "genshin-interface";
import { assert, describe, expect, test } from "vitest";

describe(useInventoryEntry, () => {
  const ENTRY_ID = 1;
  const EATER_ID = 10_001;
  const MAX_HEALTH = 1000;
  const NOW = Temporal.Instant.fromEpochMilliseconds(0);
  const dishUse: DishUse = { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected };
  // The bag holding one entry of the item id and category the test gives it
  const createInventory = (itemId: number, category: ItemCategory, quantity = 1): Inventory => ({
    items: [
      { definition: { category, id: itemId, name: "", rank: 0, rarity: 0, stackLimit: 99 }, id: ENTRY_ID, quantity },
    ],
    nextId: 2,
    quickSwapItemIds: [],
  });
  const createContext = (
    dishUseMap: ReadonlyMap<number, DishUse>,
    party = createParty([EATER_ID]),
    wallet = EMPTY_WALLET,
    cookingProgress: CookingProgress = { learnedRecipeIds: [], proficiencies: {} },
    instructionRecipeMap: ReadonlyMap<number, CookingRecipe> = new Map(),
  ) => ({
    blueprintMap: new Map<number, HomeBlueprint>(),
    cookingProgress,
    craftingProgress: { learnedRecipeIds: [] },
    craftingRecipeMap: new Map<number, CraftingRecipe>(),
    dishUseMap,
    eaterId: EATER_ID,
    forgeProgress: createForgeProgress(NOW),
    forgeRecipeMap: new Map<number, ForgeRecipe>(),
    getMaxHealth: () => MAX_HEALTH,
    homeProgress: HOME_PROGRESS,
    instructionRecipeMap,
    kitEffectState: { effects: [] },
    now: NOW,
    party,
    wallet,
  });

  test("a food is eaten through its dish's use", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    const use = useInventoryEntry(
      createInventory(DISH_ID, ItemCategory.Food),
      ENTRY_ID,
      createContext(new Map([[DISH_ID, dishUse]]), party),
    );

    expect(use?.inventory.items).toStrictEqual([]);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a food's use eats the count it is given", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;
    const use = useInventoryEntry(createInventory(DISH_ID, ItemCategory.Food, 3), ENTRY_ID, {
      ...createContext(new Map([[DISH_ID, dishUse]]), party),
      count: 2,
    });

    expect(use?.inventory.items.map(({ quantity }) => quantity)).toStrictEqual([1]);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.9);
  });

  test("using an instruction teaches its dish", () => {
    expect.hasAssertions();

    const use = useInventoryEntry(
      createInventory(INSTRUCTION_ITEM_ID, ItemCategory.Material),
      ENTRY_ID,
      createContext(new Map(), undefined, undefined, undefined, new Map([[INSTRUCTION_ITEM_ID, COOKING_RECIPE]])),
    );

    expect(use?.cookingProgress?.learnedRecipeIds).toStrictEqual([COOKING_RECIPE.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  // The instruction's materials row as the dump gives it: a Consume material of stack limit 2000, read by its name's text id
  const INSTRUCTION_NAME_TEXT_ID = "3664176372";
  const instructionMaterial: MaterialData = {
    id: INSTRUCTION_ITEM_ID,
    materialType: MaterialType.Consume,
    nameTextId: INSTRUCTION_NAME_TEXT_ID,
    rank: 1,
    rarity: 1,
    stackLimit: 2000,
  };
  const instructionNames = { [INSTRUCTION_NAME_TEXT_ID]: "Instructions" };
  const instructionMaterialDataMap = new Map([[INSTRUCTION_ITEM_ID, instructionMaterial]]);
  const createInstructionContext = () =>
    createContext(new Map(), undefined, undefined, undefined, new Map([[INSTRUCTION_ITEM_ID, COOKING_RECIPE]]));

  test("an instruction the shop sells teaches its dish once it is in the bag", () => {
    expect.hasAssertions();
    const good: ShopGood = {
      beginTime: NOW.subtract({ hours: 1 }).toString(),
      buyLimit: 0,
      costs: [{ count: 5, itemId: CurrencyItemIdMap[Currency.MasterlessStarglitter] }],
      endTime: NOW.add({ hours: 24 * 365 }).toString(),
      goodsId: 3001,
      itemCount: 1,
      itemId: INSTRUCTION_ITEM_ID,
      minPlayerLevel: 1,
      refresh: ShopRefresh.None,
    };
    const bought = buyShopGood(
      { ...EMPTY_WALLET, [Currency.MasterlessStarglitter]: 5 },
      EMPTY_INVENTORY,
      (itemId) => getItemDefinition(itemId, instructionNames, instructionMaterialDataMap),
      [],
      good,
      1,
      NOW,
    );
    assert.exists(bought);
    const [entry] = bought.inventory.items;
    assert.exists(entry);

    const use = useInventoryEntry(bought.inventory, entry.id, createInstructionContext());

    expect(use?.cookingProgress?.learnedRecipeIds).toStrictEqual([COOKING_RECIPE.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("an instruction a quest rewards teaches its dish once it is in the bag", () => {
    expect.hasAssertions();
    const granted = grantQuestRewards(
      [{ count: 1, itemId: INSTRUCTION_ITEM_ID }],
      EMPTY_INVENTORY,
      EMPTY_WALLET,
      instructionNames,
      instructionMaterialDataMap,
    );
    const [entry] = granted.inventory.items;
    assert.exists(entry);

    const use = useInventoryEntry(granted.inventory, entry.id, createInstructionContext());

    expect(use?.cookingProgress?.learnedRecipeIds).toStrictEqual([COOKING_RECIPE.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("using a diagram learns its recipe", () => {
    expect.hasAssertions();

    const use = useInventoryEntry(createInventory(FORGE_DIAGRAM_ID, ItemCategory.Material), ENTRY_ID, {
      ...createContext(new Map()),
      forgeRecipeMap: new Map([[FORGE_DIAGRAM_ID, FORGE_RECIPE]]),
    });

    expect(use?.forgeProgress?.learnedRecipeIds).toStrictEqual([FORGE_RECIPE.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("using a crafting instruction teaches its recipe", () => {
    expect.hasAssertions();

    const use = useInventoryEntry(createInventory(CRAFTING_INSTRUCTION_ID, ItemCategory.Material), ENTRY_ID, {
      ...createContext(new Map()),
      craftingRecipeMap: new Map([[CRAFTING_INSTRUCTION_ID, CRAFTING_RECIPE]]),
    });

    expect(use?.craftingProgress?.learnedRecipeIds).toStrictEqual([CRAFTING_RECIPE.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("using a blueprint's diagram learns its blueprint", () => {
    expect.hasAssertions();

    const use = useInventoryEntry(createInventory(BLUEPRINT_DIAGRAM_ID, ItemCategory.Material), ENTRY_ID, {
      ...createContext(new Map()),
      blueprintMap: new Map([[BLUEPRINT_DIAGRAM_ID, HOME_BLUEPRINT]]),
    });

    expect(use?.homeProgress?.learnedBlueprintIds).toStrictEqual([HOME_BLUEPRINT.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("a kind with no use yet is refused", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;

    expect(
      useInventoryEntry(
        createInventory(DISH_ID, ItemCategory.Material),
        ENTRY_ID,
        createContext(new Map([[DISH_ID, dishUse]]), party),
      ),
    ).toBeUndefined();
    expect(getPartyMember(party, EATER_ID).healthShare).toBe(0.5);
  });

  test("a food the dish table gives no use is refused", () => {
    expect.hasAssertions();

    expect(
      useInventoryEntry(createInventory(DISH_ID, ItemCategory.Food), ENTRY_ID, createContext(new Map())),
    ).toBeUndefined();
  });

  test("using Fragile Resin restores sixty Original Resin", () => {
    expect.hasAssertions();

    const fragileResinItem = {
      definition: {
        category: ItemCategory.Material,
        id: FRAGILE_RESIN_ITEM_ID,
        name: "",
        rank: 0,
        rarity: 0,
        stackLimit: 2,
      },
      id: ENTRY_ID,
      quantity: 2,
    };
    const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };

    expect(
      useInventoryEntry(
        { items: [fragileResinItem], nextId: 2, quickSwapItemIds: [] },
        ENTRY_ID,
        createContext(new Map(), createParty([EATER_ID]), wallet),
      ),
    ).toStrictEqual({
      inventory: { items: [{ ...fragileResinItem, quantity: 1 }], nextId: 2, quickSwapItemIds: [] },
      wallet: { ...wallet, [Currency.OriginalResin]: 100 + FRAGILE_RESIN_RESTORE },
    });
  });
});
