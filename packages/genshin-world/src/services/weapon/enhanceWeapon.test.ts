import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { UPGRADABLE_WEAPON_DATA } from "#src/services/weapon/constants.test";
import { enhanceWeapon } from "#src/services/weapon/enhanceWeapon";
import { describe, expect, test } from "vitest";

describe(enhanceWeapon, () => {
  const REQUIRED_EXPS_MAP = { "3": Array.from({ length: 40 }, () => 100) };

  test("levels up past each requirement and carries the rest", () => {
    expect.hasAssertions();
    const weapon = { ascension: 0, experience: 50, id: 1, level: 1, refinement: 1 };
    const wallet = { ...EMPTY_WALLET, [Currency.Mora]: 100 };
    expect(
      enhanceWeapon(weapon, UPGRADABLE_WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, {
        fodders: [],
        ores: [{ count: 1, id: 104011 }],
      }),
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
      data: { ...UPGRADABLE_WEAPON_DATA, baseExp: 300 },
      weapon: { ascension: 0, experience: 0, id: 2, level: 3, refinement: 1 },
    };
    expect(
      enhanceWeapon(weapon, UPGRADABLE_WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, { fodders: [fodder], ores: [] }),
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
      enhanceWeapon(weapon, UPGRADABLE_WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, {
        fodders: [],
        ores: [{ count: 1, id: 104013 }],
      }),
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
      enhanceWeapon(weapon, UPGRADABLE_WEAPON_DATA, REQUIRED_EXPS_MAP, wallet, {
        fodders: [],
        ores: [{ count: 1, id: 104011 }],
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: enhanceWeapon, 40 Mora]`,
    );
  });
});
