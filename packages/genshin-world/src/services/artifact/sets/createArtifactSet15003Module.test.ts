import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { ARTIFACT_SET_15003_ID } from "#src/services/artifact/constants";
import { createArtifactSet15003Module } from "#src/services/artifact/sets/createArtifactSet15003Module";
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

describe(createArtifactSet15003Module, () => {
  const bonus = statTables.artifactSetDataMap.get(ARTIFACT_SET_15003_ID)?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createArtifactSet15003Module(bonus);

  test.each([
    ["a Bow", WeaponType.Bow, [{ amount: 0.35, attribute: Attribute.ChargedAttackDamageBonus }]],
    ["a Catalyst", WeaponType.Catalyst, [{ amount: 0.35, attribute: Attribute.ChargedAttackDamageBonus }]],
    ["a Sword", WeaponType.Sword, []],
  ])("prices its wearer's Charged Attack DMG at 35% more with %s from four pieces", (_weapon, weaponType, bonuses) => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(createCombatant(weaponType), 1, [], [])).toStrictEqual(bonuses);
  });
});
