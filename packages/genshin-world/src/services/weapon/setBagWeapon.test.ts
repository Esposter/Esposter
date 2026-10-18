import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { setBagWeapon } from "#src/services/weapon/setBagWeapon";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(setBagWeapon, () => {
  const definition = { category: ItemCategory.Weapon, id: 1, name: "", rank: 0, rarity: 0, stackLimit: 1 };

  test("writes a weapon's state into its own entry and leaves the others as they were", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [
      { ascension: 0, definition, experience: 0, id: 0, level: 1, quantity: 1, refinement: 1 },
      { ascension: 0, definition, experience: 0, id: 1, level: 1, quantity: 1, refinement: 1 },
    ];

    expect(setBagWeapon(items, 1, { ascension: 1, experience: 0, id: 1, level: 21, refinement: 2 })).toStrictEqual([
      items[0],
      { ascension: 1, definition, experience: 0, id: 1, level: 21, quantity: 1, refinement: 2 },
    ]);
  });
});
