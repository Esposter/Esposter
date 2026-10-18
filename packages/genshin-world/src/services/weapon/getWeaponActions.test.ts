import type { WeaponData } from "#src/models/weapon/WeaponData";

import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { getWeaponActions } from "#src/services/weapon/getWeaponActions";
import { describe, expect, test } from "vitest";

describe(getWeaponActions, () => {
  const WEAPON_DATA: WeaponData = {
    ascensionPhases: [
      { attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 },
      { attributeLines: [], coinCost: 0, costItems: [], maxLevel: 40, requiredPlayerLevel: 20 },
    ],
    baseExp: 1800,
    destroyReturnMaterial: 0,
    destroyReturnMaterialCount: 0,
    destroyRule: DestroyRule.None,
    growAttributes: [],
    id: 1,
    nameTextId: "1",
    passiveNameTextId: "",
    passiveRankDescriptionTextIds: [],
    passiveRankParams: [],
    rarity: 3,
    refinementCosts: [500, 1000, 2000, 4000],
    refinementMaterialId: 0,
    weaponType: WeaponType.Sword,
  };

  test("Ascend is offered only at the level cap", () => {
    expect.hasAssertions();
    expect(
      getWeaponActions({ ascension: 0, experience: 0, id: 1, level: 19, refinement: 1 }, WEAPON_DATA),
    ).toStrictEqual({ canAscend: false, canRefine: true });
    expect(
      getWeaponActions({ ascension: 0, experience: 0, id: 1, level: 20, refinement: 1 }, WEAPON_DATA),
    ).toStrictEqual({ canAscend: true, canRefine: true });
  });

  test("Ascend is not offered at the last phase's cap", () => {
    expect.hasAssertions();
    expect(
      getWeaponActions({ ascension: 1, experience: 0, id: 1, level: 40, refinement: 1 }, WEAPON_DATA),
    ).toStrictEqual({ canAscend: false, canRefine: true });
  });

  test("Refine is not offered at rank five", () => {
    expect.hasAssertions();
    expect(
      getWeaponActions({ ascension: 0, experience: 0, id: 1, level: 1, refinement: 5 }, WEAPON_DATA),
    ).toStrictEqual({ canAscend: false, canRefine: false });
  });

  test("Refine is not offered for a weapon with no refinement costs", () => {
    expect.hasAssertions();
    expect(
      getWeaponActions(
        { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
        { ...WEAPON_DATA, rarity: 2, refinementCosts: [] },
      ),
    ).toStrictEqual({ canAscend: false, canRefine: false });
  });
});
