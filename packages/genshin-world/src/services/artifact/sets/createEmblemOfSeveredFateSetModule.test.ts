import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { EMBLEM_OF_SEVERED_FATE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createEmblemOfSeveredFateSetModule } from "#src/services/artifact/sets/createEmblemOfSeveredFateSetModule";
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
// The wearer with the Energy Recharge given, as its attributes total it
const createWearer = (energyRecharge: number): Combatant => {
  const attributes = computeCharacterAttributes([]);
  return {
    ascension: 0,
    attributes: {
      ...attributes,
      attributeTotalMap: { ...attributes.attributeTotalMap, [Attribute.EnergyRecharge]: energyRecharge },
    },
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: KIT,
    level: 1,
  };
};
const createStrike = (attackTag: AttackTag, combatant: Combatant): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  hit: KIT.plungeCollision,
});
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(EMBLEM_OF_SEVERED_FATE_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createEmblemOfSeveredFateSetModule, () => {
  test("raises the Elemental Burst DMG by 25% of the wearer's Energy Recharge from four pieces", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createEmblemOfSeveredFateSetModule(bonusOf(4));
    const wearer = createWearer(1.5);

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst, wearer), enemy, party, [])).toBeCloseTo(0.375);
    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill, wearer), enemy, party, [])).toBe(0);
  });

  test("caps the Elemental Burst DMG it raises at 75%", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const { getStrikeDamageBonus } = createEmblemOfSeveredFateSetModule(bonusOf(4));
    const wearer = createWearer(4);

    expect(getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst, wearer), enemy, party, [])).toBeCloseTo(0.75);
  });
});
