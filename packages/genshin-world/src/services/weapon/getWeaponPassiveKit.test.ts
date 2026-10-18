import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getWeaponPassiveKit } from "#src/services/weapon/getWeaponPassiveKit";
import { describe, expect, test } from "vitest";

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// Full HP Critic Up's weapon, with its name's text id and each refinement rank's CRIT Rate as its table gives them
const WEAPON_DATA: WeaponData = {
  ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 20, requiredPlayerLevel: 0 }],
  baseExp: 0,
  destroyReturnMaterial: 0,
  destroyReturnMaterialCount: 0,
  destroyRule: DestroyRule.None,
  growAttributes: [],
  id: 11302,
  nameTextId: "1",
  passiveNameTextId: "2866125259",
  passiveRankDescriptionTextIds: ["1", "2", "3", "4", "5"],
  passiveRankParams: [[0.14], [0.175], [0.21], [0.245], [0.28]],
  rarity: 3,
  refinementCosts: [500, 1000, 2000, 4000],
  refinementMaterialId: 0,
  weaponType: WeaponType.Sword,
};

// The CRIT Rate a wielder of the weapon at a refinement rank is priced with at full HP
const getCriticalRateLines = (refinement: number, kit: Kit = KIT) => {
  const weaponKit = getWeaponPassiveKit(
    kit,
    { ascension: 0, experience: 0, id: 11302, level: 1, refinement },
    WEAPON_DATA,
  );
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: weaponKit,
    level: 90,
  };
  return (weaponKit.getPassiveBonuses?.(combatant, 1) ?? []).filter(
    ({ attribute }) => attribute === Attribute.CriticalRate,
  );
};

describe(getWeaponPassiveKit, () => {
  test("a weapon at refinement rank one reads its first passive row", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(1)).toStrictEqual([{ amount: 0.14, attribute: Attribute.CriticalRate }]);
  });

  test("raising refinement changes the passive's effect", () => {
    expect.hasAssertions();

    expect(getCriticalRateLines(2)).toStrictEqual([{ amount: 0.175, attribute: Attribute.CriticalRate }]);
  });
});
