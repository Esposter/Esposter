import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { refineWeapon } from "#src/services/weapon/refineWeapon";
import { describe, expect, test } from "vitest";

const WEAPON_DATA: WeaponData = {
  ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 }],
  baseExp: 1800,
  growAttributes: [],
  id: 1,
  nameTextId: "1",
  rarity: 3,
  refinementCosts: [500, 1000, 2000, 4000],
  refinementMaterialId: 0,
  weaponType: WeaponType.Sword,
};

describe(refineWeapon, () => {
  test("pays the Mora each rank gained costs, a copy of rank two gaining two ranks", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 1, refinement: 2 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 3000 };
    expect(refineWeapon(weapon, WEAPON_DATA, wallet, 2)).toStrictEqual({
      lostRanks: 0,
      wallet: EMPTY_WALLET,
      weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 4 },
    });
  });

  test("loses the ranks past the fifth and charges only the ranks it gains", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 1, refinement: 4 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 4000 };
    expect(refineWeapon(weapon, WEAPON_DATA, wallet, 2)).toStrictEqual({
      lostRanks: 1,
      wallet: EMPTY_WALLET,
      weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 5 },
    });
  });

  test("refuses a weapon with no refinement to take", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 };
    expect(() =>
      refineWeapon(weapon, { ...WEAPON_DATA, rarity: 2, refinementCosts: [] }, EMPTY_WALLET, 1),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: refineWeapon, refinement 1]`,
    );
  });
});
