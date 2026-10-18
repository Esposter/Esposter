import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { countShopCost } from "#src/services/shop/countShopCost";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(countShopCost, () => {
  const FISH_ITEM_ID = 9001;
  const FISH_HELD = 3;
  const fishDefinition: ItemDefinition = {
    category: ItemCategory.Material,
    id: FISH_ITEM_ID,
    name: "Fish",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const MORA_HELD = 7;
  const inventoryWithFish: Inventory = {
    items: [{ definition: fishDefinition, id: 0, quantity: FISH_HELD }],
    nextId: 1,
    quickSwapItemIds: [],
  };

  test("counts a currency cost from the wallet", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: MORA_HELD };
    expect(countShopCost(inventoryWithFish, wallet, MORA_ITEM_ID)).toBe(MORA_HELD);
  });

  test("counts an item cost from the bag, whatever the wallet holds", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: MORA_HELD };
    expect(countShopCost(inventoryWithFish, wallet, FISH_ITEM_ID)).toBe(FISH_HELD);
  });

  test("counts zero for an item cost the bag does not hold", () => {
    expect.hasAssertions();

    expect(countShopCost(EMPTY_INVENTORY, EMPTY_WALLET, FISH_ITEM_ID)).toBe(0);
  });
});
