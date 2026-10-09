import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { spendCondensedResin } from "#src/services/originalResin/spendCondensedResin";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(spendCondensedResin, () => {
  const CONDENSED_RESIN_STACK_LIMIT = 5;
  const condensedResinDefinition = {
    category: ItemCategory.Material,
    id: CONDENSED_RESIN_ITEM_ID,
    name: "",
    rank: 0,
    rarity: 0,
    stackLimit: CONDENSED_RESIN_STACK_LIMIT,
  };
  const condensedResinItem: InventoryItem = { definition: condensedResinDefinition, id: 1, quantity: 2 };

  test("a ley line's or a domain's claim takes one Condensed Resin out of its stack", () => {
    expect.hasAssertions();

    expect(spendCondensedResin({ items: [condensedResinItem], nextId: 2 }, BlossomKind.Domain)).toStrictEqual({
      items: [{ ...condensedResinItem, quantity: 1 }],
      nextId: 2,
    });
  });

  test("a boss's claim takes no Condensed Resin, and a bag holding none gives undefined", () => {
    expect.hasAssertions();

    expect(spendCondensedResin({ items: [condensedResinItem], nextId: 2 }, BlossomKind.NormalBoss)).toBeUndefined();
    expect(spendCondensedResin({ items: [], nextId: 1 }, BlossomKind.LeyLine)).toBeUndefined();
  });
});
