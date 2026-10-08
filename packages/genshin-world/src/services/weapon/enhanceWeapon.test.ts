import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Currency } from "#src/models/inventory/Currency";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { describe, expect, test } from "vitest";

describe(enhanceWeapon, () => {
  const REQUIRED_EXPS_MAP = { "3": Array.from({ length: 40 }, () => 100) };
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
    growAttributes: [],
    id: 1,
    nameTextId: "1",
    rarity: 3,
    refinementCosts: [500, 1000, 2000, 4000],
    refinementMaterialId: 0,
    weaponType: WeaponType.Sword,
  };

  test("levels up past each requirement and carries the rest", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 50, id: 1, level: 1, refinement: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
    expect(
      enhanceWeapon(weapon, WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, { fodders: [], ores: [{ count: 1, id: 104011 }] }),
    ).toStrictEqual({
      returnedOres: [],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 60 },
      weapon: { ascension: 0, experience: 50, id: 1, level: 5, refinement: 1 },
    });
  });

  test("takes a fodder's base as paid EXP and the share of its own levelling as free", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
    const fodder = {
      data: { ...WEAPON_DATA, baseExp: 300 },
      weapon: { ascension: 0, experience: 0, id: 2, level: 3, refinement: 1 },
    };
    expect(
      enhanceWeapon(weapon, WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, { fodders: [fodder], ores: [] }),
    ).toStrictEqual({
      returnedOres: [],
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 70 },
      weapon: { ascension: 0, experience: 60, id: 1, level: 5, refinement: 1 },
    });
  });

  test("returns the EXP past the cap as the ores it fills, largest first", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 19, refinement: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 1000 };
    expect(
      enhanceWeapon(weapon, WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, { fodders: [], ores: [{ count: 1, id: 104013 }] }),
    ).toStrictEqual({
      returnedOres: [
        { count: 4, id: 104012 },
        { count: 4, id: 104011 },
      ],
      wallet: EMPTY_WALLET,
      weapon: { ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 },
    });
  });

  test("refuses EXP the wallet cannot pay for", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 39 };
    expect(() =>
      enhanceWeapon(weapon, WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, { fodders: [], ores: [{ count: 1, id: 104011 }] }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: enhanceWeapon, 40 Mora]`,
    );
  });
});
