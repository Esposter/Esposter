import type { DishUse } from "#src/models/cooking/DishUse";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { Attribute } from "#src/models/character/Attribute";
import { DishTarget } from "#src/models/cooking/DishTarget";
import { checkIsInventoryItemAmountable } from "#src/services/inventory/checkIsInventoryItemAmountable";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(checkIsInventoryItemAmountable, () => {
  const DISH_ID = 108_011;
  const healDishUse: DishUse = { heal: { flat: 0, healthShare: 0 }, target: DishTarget.Selected };
  const food: InventoryItem = {
    definition: { category: ItemCategory.Food, id: DISH_ID, name: "", rank: 0, rarity: 0, stackLimit: 99 },
    id: 1,
    quantity: 1,
  };

  test.each<[string, DishUse, boolean]>([
    ["a food whose dish heals takes an amount", healDishUse, true],
    ["a food whose dish revives takes an amount", { revive: { flat: 0 }, target: DishTarget.Selected }, true],
    [
      "a food whose dish gives a bonus only takes no amount",
      {
        bonus: { attributes: [{ amount: 0, attribute: Attribute.Attack }], seconds: 0, source: "" },
        target: DishTarget.Selected,
      },
      false,
    ],
  ])("%s", (_title, dishUse, isAmountable) => {
    expect.hasAssertions();

    expect(checkIsInventoryItemAmountable(food, new Map([[DISH_ID, dishUse]]))).toBe(isAmountable);
  });

  test("an entry that is not a food takes no amount", () => {
    expect.hasAssertions();
    const material: InventoryItem = { ...food, definition: { ...food.definition, category: ItemCategory.Material } };

    expect(checkIsInventoryItemAmountable(material, new Map([[DISH_ID, healDishUse]]))).toBe(false);
  });
});
