import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { craftRecipe } from "#src/services/crafting/craftRecipe";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createDefinition = (id: number, stackLimit = 99): ItemDefinition => ({
  category: ItemCategory.Material,
  id,
  name: "",
  rank: 0,
  rarity: 0,
  stackLimit,
});

describe(craftRecipe, () => {
  const ADVENTURE_RANK = 10;
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const MATERIAL_ID = 112_002;
  const RESULT_ID = 112_004;
  const CRYSTAL_CORE_ID = 100_085;
  const CONDENSED_RESIN_ID = 220_007;
  const INSTRUCTION_ID = 221_007;
  const CONDENSED_RESIN_STACK_LIMIT = 5;
  const materialDefinition = createDefinition(MATERIAL_ID);
  const resultDefinition = createDefinition(RESULT_ID);
  const condensedResinDefinition = createDefinition(CONDENSED_RESIN_ID, CONDENSED_RESIN_STACK_LIMIT);
  const tierRecipe: CraftingRecipe = {
    combineType: 1,
    id: 11_002,
    kind: CraftingRecipeKind.Tier,
    materials: [{ count: 3, id: MATERIAL_ID }],
    mora: 50,
    nameTextId: "1",
    playerLevel: 1,
    resultCount: 1,
    resultItemId: RESULT_ID,
    unlockItemIds: [],
  };
  const condensedResinRecipe: CraftingRecipe = {
    combineType: 6,
    id: 22_007,
    kind: CraftingRecipeKind.CondensedResin,
    materials: [
      { count: 60, id: ORIGINAL_RESIN_ITEM_ID },
      { count: 1, id: CRYSTAL_CORE_ID },
    ],
    mora: 100,
    nameTextId: "1",
    playerLevel: ADVENTURE_RANK,
    resultCount: 1,
    resultItemId: CONDENSED_RESIN_ID,
    unlockItemIds: [INSTRUCTION_ID],
  };
  const learnedProgress = { learnedRecipeIds: [condensedResinRecipe.id] };
  const crystalCore = createDefinition(CRYSTAL_CORE_ID);
  const craftingState = (inventory: Inventory, wallet: Wallet, progress = learnedProgress) => ({
    adventureRank: ADVENTURE_RANK,
    inventory,
    now: EPOCH,
    progress,
    wallet,
  });

  test("should take the materials and Mora of the whole batch and put every result in the bag", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: materialDefinition, id: 0, quantity: 6 }], nextId: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 200 };
    const result = craftRecipe(tierRecipe, 2, resultDefinition, {
      ...craftingState(inventory, wallet, { learnedRecipeIds: [] }),
    });

    expect(result?.inventory).toStrictEqual({
      items: [{ definition: resultDefinition, id: 1, quantity: 2 }],
      nextId: 2,
    });
    expect(result?.wallet[Currency.Mora]).toBe(100);
  });

  test("should refuse a batch the Mora does not pay for, spending nothing", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: materialDefinition, id: 0, quantity: 9 }], nextId: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };

    expect(craftRecipe(tierRecipe, 3, resultDefinition, craftingState(inventory, wallet))).toBeUndefined();
  });

  test("should refuse a count that is not whole", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: materialDefinition, id: 0, quantity: 9 }], nextId: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 300 };

    expect(craftRecipe(tierRecipe, 1.5, resultDefinition, craftingState(inventory, wallet))).toBeUndefined();
  });

  test("should refuse a Condensed Resin the bag has no stack room for, the bag holding its limit of five", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [
        { definition: crystalCore, id: 0, quantity: 1 },
        { definition: condensedResinDefinition, id: 1, quantity: CONDENSED_RESIN_STACK_LIMIT },
      ],
      nextId: 2,
    };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000 };

    expect(
      craftRecipe(condensedResinRecipe, 1, condensedResinDefinition, craftingState(inventory, wallet)),
    ).toBeUndefined();
  });

  test("should pay Condensed Resin's Original Resin from the wallet, not the bag", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: crystalCore, id: 0, quantity: 1 }], nextId: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000, [Currency.OriginalResin]: 200 };
    const result = craftRecipe(condensedResinRecipe, 1, condensedResinDefinition, craftingState(inventory, wallet));

    expect(result?.wallet[Currency.OriginalResin]).toBe(140);
    expect(result?.wallet[Currency.Mora]).toBe(900);
    expect(result?.inventory.items).toStrictEqual([{ definition: condensedResinDefinition, id: 1, quantity: 1 }]);
  });

  test("should refuse a recipe an instruction opens while it is not learned", () => {
    expect.hasAssertions();

    const inventory: Inventory = { items: [{ definition: crystalCore, id: 0, quantity: 1 }], nextId: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000 };

    expect(
      craftRecipe(
        condensedResinRecipe,
        1,
        condensedResinDefinition,
        craftingState(inventory, wallet, { learnedRecipeIds: [] }),
      ),
    ).toBeUndefined();
  });
});
