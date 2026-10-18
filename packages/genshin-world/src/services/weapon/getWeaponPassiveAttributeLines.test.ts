import type { WeaponData } from "#src/models/weapon/WeaponData";

import { Attribute } from "#src/models/character/Attribute";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { getWeaponPassiveAttributeLines } from "#src/services/weapon/getWeaponPassiveAttributeLines";
import { describe, expect, test } from "vitest";

describe(getWeaponPassiveAttributeLines, () => {
  const WEAPON_DATA: WeaponData = {
    ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 }],
    baseExp: 0,
    destroyReturnMaterial: 0,
    destroyReturnMaterialCount: 0,
    destroyRule: DestroyRule.None,
    growAttributes: [],
    id: 1,
    nameTextId: "1",
    passiveNameTextId: "3",
    passiveRankAttributeLines: [
      [{ attribute: Attribute.AttackPercent, value: 0.2 }],
      [{ attribute: Attribute.AttackPercent, value: 0.25 }],
    ],
    passiveRankDescriptionTextIds: ["4", "5"],
    passiveRankParams: [[0.2], [0.25]],
    rarity: 4,
    refinementCosts: [500],
    refinementMaterialId: 0,
    weaponType: WeaponType.Sword,
  };

  test("a weapon's static passive adds its stat at its refinement", () => {
    expect.hasAssertions();

    expect(
      getWeaponPassiveAttributeLines({ ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 }, WEAPON_DATA),
    ).toStrictEqual([{ attribute: Attribute.AttackPercent, value: 0.2 }]);
    expect(
      getWeaponPassiveAttributeLines({ ascension: 0, experience: 0, id: 1, level: 1, refinement: 2 }, WEAPON_DATA),
    ).toStrictEqual([{ attribute: Attribute.AttackPercent, value: 0.25 }]);
  });
});
