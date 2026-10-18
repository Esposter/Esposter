import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { getBagWeapon } from "#src/services/weapon/getBagWeapon";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(getBagWeapon, () => {
  const weaponDefinition = { category: ItemCategory.Weapon, id: 1, name: "", rank: 0, rarity: 0, stackLimit: 1 };
  const materialDefinition = { category: ItemCategory.Material, id: 2, name: "", rank: 0, rarity: 0, stackLimit: 9 };

  test("reads a weapon's state from its entry", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [
      { ascension: 1, definition: weaponDefinition, experience: 2, id: 0, level: 21, quantity: 1, refinement: 3 },
    ];

    expect(getBagWeapon(items, 0)).toStrictEqual({ ascension: 1, experience: 2, id: 1, level: 21, refinement: 3 });
  });

  test("refuses an entry that holds no weapon state", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [{ definition: materialDefinition, id: 0, quantity: 3 }];

    expect(() => getBagWeapon(items, 0)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getBagWeapon, weapon 0 without its state]`,
    );
  });
});
