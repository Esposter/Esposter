import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ARTIFACT_SET_15015_ID } from "#src/services/artifact/constants";
import { createArtifactSet15015Module } from "#src/services/artifact/sets/createArtifactSet15015Module";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { assert, describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 2;
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
const deployed = (isOnField: boolean): DeployedCombatant[] => [{ ...wearer, isOnField }];
const liveShield: KitEffect = { characterId: OTHER_CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 5 };
const shieldedBonuses = [
  { amount: 0.4, attribute: Attribute.NormalAttackDamageBonus },
  { amount: 0.4, attribute: Attribute.ChargedAttackDamageBonus },
];

describe(createArtifactSet15015Module, () => {
  const bonus = statTables.artifactSetDataMap.get(ARTIFACT_SET_15015_ID)?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createArtifactSet15015Module(bonus);

  test("prices its wearer at 40% more Normal and Charged Attack DMG while a shield is live on the wearer on the field", () => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(wearer, 1, deployed(true), [liveShield])).toStrictEqual(shieldedBonuses);
  });

  test("prices nothing without a live shield, or with the wearer off the field", () => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(wearer, 1, deployed(true), [])).toStrictEqual([]);
    expect(module.getPassiveBonuses?.(wearer, 1, deployed(false), [liveShield])).toStrictEqual([]);
  });
});
