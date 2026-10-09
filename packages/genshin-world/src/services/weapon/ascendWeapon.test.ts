import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { ascendWeapon } from "#src/services/weapon/ascendWeapon";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(ascendWeapon, () => {
  const WEAPON_DATA: WeaponData = {
    ascensionPhases: [
      { attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 },
      {
        attributeLines: [],
        coinCost: 500,
        costItems: [{ count: 3, id: 114001 }],
        maxLevel: 40,
        requiredPlayerLevel: 15,
      },
    ],
    baseExp: 1800,
    destroyReturnMaterial: 0,
    destroyReturnMaterialCount: 0,
    destroyRule: DestroyRule.None,
    growAttributes: [],
    id: 1,
    nameTextId: "1",
    rarity: 3,
    refinementCosts: [500, 1000, 2000, 4000],
    refinementMaterialId: 0,
    weaponType: WeaponType.Sword,
  };
  const MATERIAL: ItemDefinition = {
    category: ItemCategory.Material,
    id: 114001,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };

  test("takes the next phase's Mora and items and moves the weapon into it", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(
      ascendWeapon(weapon, WEAPON_DATA, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toStrictEqual({
      inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1 },
      wallet: EMPTY_WALLET,
      weapon: { ascension: 1, experience: 0, id: 1, level: 20, refinement: 1 },
    });
  });

  test("refuses an Adventure Rank below the phase's requirement", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 };
    expect(() =>
      ascendWeapon(weapon, WEAPON_DATA, {
        adventureRank: 14,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ascendWeapon, Adventure Rank 14]`,
    );
  });

  test("refuses a weapon below its phase's cap", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 19, refinement: 1 };
    expect(() =>
      ascendWeapon(weapon, WEAPON_DATA, {
        adventureRank: 15,
        inventory: { items: [{ definition: MATERIAL, id: 0, quantity: 5 }], nextId: 1 },
        wallet: { ...EMPTY_WALLET, [Currency.Mora]: 500 },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: ascendWeapon, level 19 is not at a phase's cap]`,
    );
  });
});
