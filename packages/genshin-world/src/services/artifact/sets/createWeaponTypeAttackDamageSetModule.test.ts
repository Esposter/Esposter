import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { createWeaponTypeAttackDamageSetModule } from "#src/services/artifact/sets/createWeaponTypeAttackDamageSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (weaponType?: WeaponType): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
  weaponType,
});

describe(createWeaponTypeAttackDamageSetModule, () => {
  const module = createWeaponTypeAttackDamageSetModule({
    amount: 0.35,
    attribute: Attribute.NormalAttackDamageBonus,
    weaponTypes: [WeaponType.Sword, WeaponType.Claymore, WeaponType.Polearm],
  });

  test.each([
    [
      "a wielder of a listed weapon",
      WeaponType.Claymore,
      [{ amount: 0.35, attribute: Attribute.NormalAttackDamageBonus }],
    ],
    ["nothing for a wielder of another weapon", WeaponType.Bow, []],
    ["nothing for a character with no weapon", undefined, []],
  ])("prices %s", (_description, weaponType, bonuses) => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(createCombatant(weaponType), 1, [], [])).toStrictEqual(bonuses);
  });
});
