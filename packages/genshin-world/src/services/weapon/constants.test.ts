import type { WeaponData } from "#src/models/weapon/WeaponData";

import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { describe } from "vitest";

// A weapon with a second ascension phase, the record the ascend and enhance suites both wield
export const UPGRADABLE_WEAPON_DATA: WeaponData = {
  ascensionPhases: [
    { attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 },
    { attributeLines: [], coinCost: 500, costItems: [{ count: 3, id: 114001 }], maxLevel: 40, requiredPlayerLevel: 15 },
  ],
  baseExp: 1800,
  destroyReturnMaterial: 0,
  destroyReturnMaterialCount: 0,
  destroyRule: DestroyRule.None,
  growAttributes: [],
  id: 1,
  nameTextId: "1",
  passiveNameTextId: "",
  passiveRankAttributeLines: [],
  passiveRankDescriptionTextIds: [],
  passiveRankParams: [],
  rarity: 3,
  refinementCosts: [500, 1000, 2000, 4000],
  refinementMaterialId: 0,
  weaponType: WeaponType.Sword,
};

describe.todo("constants");
