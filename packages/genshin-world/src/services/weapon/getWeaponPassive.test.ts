import type { WeaponData } from "#src/models/weapon/WeaponData";

import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { getWeaponPassive } from "#src/services/weapon/getWeaponPassive";
import { describe, expect, test } from "vitest";

describe(getWeaponPassive, () => {
  const NAME_TEXT: Record<string, string> = { 10: "Passive", 11: "Rank one", 12: "Rank two", 13: "Rank three" };
  const WEAPON_DATA: WeaponData = {
    ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 }],
    baseExp: 1800,
    destroyReturnMaterial: 0,
    destroyReturnMaterialCount: 0,
    destroyRule: DestroyRule.None,
    growAttributes: [],
    id: 1,
    nameTextId: "1",
    passiveNameTextId: "10",
    passiveRankAttributeLines: [[], [], []],
    passiveRankDescriptionTextIds: ["11", "12", "13"],
    passiveRankParams: [[0.1], [0.2], [0.3]],
    rarity: 4,
    refinementCosts: [500, 1000],
    refinementMaterialId: 0,
    weaponType: WeaponType.Sword,
  };

  test("a weapon with a passive shows its description at its rank", () => {
    expect.hasAssertions();

    expect(getWeaponPassive(WEAPON_DATA, 2, NAME_TEXT)).toStrictEqual({
      name: "Passive",
      rows: [
        { description: "Rank one", isHeld: false },
        { description: "Rank two", isHeld: true },
        { description: "Rank three", isHeld: false },
      ],
    });
  });

  test("a weapon with no passive shows none", () => {
    expect.hasAssertions();

    expect(
      getWeaponPassive({ ...WEAPON_DATA, passiveNameTextId: "", passiveRankDescriptionTextIds: [] }, 1, NAME_TEXT),
    ).toBeUndefined();
  });
});
