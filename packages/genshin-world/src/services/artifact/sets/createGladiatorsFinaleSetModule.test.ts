import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { GLADIATORS_FINALE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createGladiatorsFinaleSetModule } from "#src/services/artifact/sets/createGladiatorsFinaleSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (weaponType: WeaponType): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
  weaponType,
});

describe(createGladiatorsFinaleSetModule, () => {
  const bonus = statTables.artifactSetDataMap
    .get(GLADIATORS_FINALE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createGladiatorsFinaleSetModule(bonus);

  test.each([
    ["a Sword", WeaponType.Sword, [{ amount: 0.35, attribute: Attribute.NormalAttackDamageBonus }]],
    ["a Claymore", WeaponType.Claymore, [{ amount: 0.35, attribute: Attribute.NormalAttackDamageBonus }]],
    ["a Polearm", WeaponType.Polearm, [{ amount: 0.35, attribute: Attribute.NormalAttackDamageBonus }]],
    ["a Bow", WeaponType.Bow, []],
  ])("prices its wearer's Normal Attack DMG at 35% more with %s from four pieces", (_weapon, weaponType, bonuses) => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(createCombatant(weaponType), 1, [], [])).toStrictEqual(bonuses);
  });
});
