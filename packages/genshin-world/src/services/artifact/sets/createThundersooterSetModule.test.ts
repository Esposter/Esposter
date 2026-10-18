import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { AttackTag } from "#src/models/combat/AttackTag";
import { THUNDERSOOTER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createThundersooterSetModule } from "#src/services/artifact/sets/createThundersooterSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
};
const strike: KitStrike = {
  attackTag: AttackTag.ElementalSkill,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wearer,
  hit: KIT.plungeCollision,
};
const party = createParty([TRAVELER_CHARACTER_ID]);
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(THUNDERSOOTER_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};
// An enemy under the aura given, or under none
const createEnemyUnder = (auraType?: AuraType) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  if (auraType !== undefined) enemy.elementalState.auras.set(auraType, { decayRate: 0, gauge: 1, isImmutable: false });
  return enemy;
};

describe(createThundersooterSetModule, () => {
  test("raises the DMG of a strike on an enemy under Electro by 35% from four pieces", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createThundersooterSetModule(bonusOf(4));

    expect(getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Electro), party, [])).toBeCloseTo(0.35);
  });

  test("raises no DMG on an enemy under another element or none", () => {
    expect.hasAssertions();

    const { getStrikeDamageBonus } = createThundersooterSetModule(bonusOf(4));

    expect(getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Pyro), party, [])).toBe(0);
    expect(getStrikeDamageBonus?.(strike, createEnemyUnder(), party, [])).toBe(0);
  });
});
