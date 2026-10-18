import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";

import { CookingFoodType } from "#src/models/cooking/CookingFoodType";
import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { DishTarget } from "#src/models/cooking/DishTarget";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { useInventoryEntry } from "#src/services/inventory/useInventoryEntry";
import { FRAGILE_RESIN_ITEM_ID, FRAGILE_RESIN_RESTORE } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(useInventoryEntry, () => {
  const DISH_ID = 108_011;
  const ENTRY_ID = 1;
  const EATER_ID = 10_001;
  const MAX_HEALTH = 1000;
  const NOW = Temporal.Instant.fromEpochMilliseconds(0);
  const dishUse: DishUse = { heal: { flat: 0, healthShare: 0.2 }, target: DishTarget.Selected };
  const INSTRUCTION_ITEM_ID = 109_101;
  const recipe: CookingRecipe = {
    foodType: CookingFoodType.Heal,
    id: 1,
    ingredients: [],
    isDefaultUnlocked: false,
    maxProficiency: 2,
    nameTextId: "1",
    qteParam: [0.5, 0.4],
    rankLevel: 1,
    resultItemIds: {
      [CookingQuality.Delicious]: DISH_ID,
      [CookingQuality.Regular]: DISH_ID,
      [CookingQuality.Suspicious]: DISH_ID,
    },
    specialties: [],
    unlockItemIds: [INSTRUCTION_ITEM_ID],
  };
  const createInventory = (category: ItemCategory): Inventory => ({
    items: [
      {
        definition: { category, id: DISH_ID, name: "", rank: 0, rarity: 0, stackLimit: 99 },
        id: ENTRY_ID,
        quantity: 1,
      },
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
    cookingProgress,
    dishUseMap,
    eaterId: EATER_ID,
    getMaxHealth: () => MAX_HEALTH,
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
      createInventory(ItemCategory.Food),
      ENTRY_ID,
      createContext(new Map([[DISH_ID, dishUse]]), party),
    );

    expect(use?.inventory.items).toStrictEqual([]);
    expect(getPartyMember(party, EATER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("using an instruction teaches its dish", () => {
    expect.hasAssertions();
    const inventory: Inventory = {
      items: [
        {
          definition: {
            category: ItemCategory.Material,
            id: INSTRUCTION_ITEM_ID,
            name: "",
            rank: 0,
            rarity: 0,
            stackLimit: 99,
          },
          id: ENTRY_ID,
          quantity: 1,
        },
      ],
      nextId: 2,
      quickSwapItemIds: [],
    };
    const use = useInventoryEntry(
      inventory,
      ENTRY_ID,
      createContext(new Map(), undefined, undefined, undefined, new Map([[INSTRUCTION_ITEM_ID, recipe]])),
    );

    expect(use?.cookingProgress?.learnedRecipeIds).toStrictEqual([recipe.id]);
    expect(use?.inventory.items).toStrictEqual([]);
  });

  test("a kind with no use yet is refused", () => {
    expect.hasAssertions();

    const party = createParty([EATER_ID]);
    getPartyMember(party, EATER_ID).healthShare = 0.5;

    expect(
      useInventoryEntry(
        createInventory(ItemCategory.Material),
        ENTRY_ID,
        createContext(new Map([[DISH_ID, dishUse]]), party),
      ),
    ).toBeUndefined();
    expect(getPartyMember(party, EATER_ID).healthShare).toBe(0.5);
  });

  test("a food the dish table gives no use is refused", () => {
    expect.hasAssertions();

    expect(useInventoryEntry(createInventory(ItemCategory.Food), ENTRY_ID, createContext(new Map()))).toBeUndefined();
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
