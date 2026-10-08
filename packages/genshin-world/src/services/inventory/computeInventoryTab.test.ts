import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { computeInventoryTab } from "#src/services/inventory/computeInventoryTab";
import { InventorySort, ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createItem = (
  category: ItemCategory,
  id: number,
  rarity: number,
  rank: number,
  level?: number,
): InventoryItem => ({ definition: { category, id, name: "", rank, rarity, stackLimit: 1 }, id, level, quantity: 1 });

describe(computeInventoryTab, () => {
  const sortOrder = { isDescending: true, sort: InventorySort.Level };

  test("sorts weapons by the chosen key, the other breaking a tie the same way", () => {
    expect.hasAssertions();

    const lowLevel = createItem(ItemCategory.Weapon, 0, 0, 0, 0);
    const highLevel = createItem(ItemCategory.Weapon, 1, 0, 0, 1);
    const highQuality = createItem(ItemCategory.Weapon, 2, 1, 0, 0);
    const items = [lowLevel, highLevel, highQuality];

    expect(computeInventoryTab(items, ItemCategory.Weapon, sortOrder)).toStrictEqual([
      highLevel,
      highQuality,
      lowLevel,
    ]);
    expect(
      computeInventoryTab(items, ItemCategory.Weapon, { isDescending: false, sort: InventorySort.Quality }),
    ).toStrictEqual([lowLevel, highLevel, highQuality]);
  });

  test("runs furnishings from the first obtained", () => {
    expect.hasAssertions();

    const first = createItem(ItemCategory.Furnishing, 0, 0, 1);
    const second = createItem(ItemCategory.Furnishing, 1, 1, 0);

    expect(computeInventoryTab([second, first], ItemCategory.Furnishing, sortOrder)).toStrictEqual([first, second]);
  });

  test("runs gadgets from the highest quality down, then by the game's order", () => {
    expect.hasAssertions();

    const lowQuality = createItem(ItemCategory.Gadget, 0, 0, 0);
    const firstRanked = createItem(ItemCategory.Gadget, 1, 1, 0);
    const secondRanked = createItem(ItemCategory.Gadget, 2, 1, 1);

    expect(computeInventoryTab([lowQuality, secondRanked, firstRanked], ItemCategory.Gadget, sortOrder)).toStrictEqual([
      firstRanked,
      secondRanked,
      lowQuality,
    ]);
  });

  test("keeps the game's order of materials and leaves out the other tabs", () => {
    expect.hasAssertions();

    const firstRanked = createItem(ItemCategory.Material, 1, 0, 0);
    const secondRanked = createItem(ItemCategory.Material, 0, 1, 1);
    const food = createItem(ItemCategory.Food, 2, 0, 0);

    expect(computeInventoryTab([secondRanked, food, firstRanked], ItemCategory.Material, sortOrder)).toStrictEqual([
      firstRanked,
      secondRanked,
    ]);
  });
});
