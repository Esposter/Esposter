import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createSkillAndBurstDamagePassiveModule } from "#src/services/weapon/passives/createSkillAndBurstDamagePassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// The Stringless at its first rank: twenty-four per cent more Elemental Skill and Elemental Burst DMG
const skillAndBurstDamagePassiveModule = createSkillAndBurstDamagePassiveModule([0.24]);
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});

describe(createSkillAndBurstDamagePassiveModule, () => {
  test("an elemental skill and an elemental burst are raised by the rank's percentage", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party),
    ).toBeCloseTo(0.24);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalBurst), enemy, party),
    ).toBeCloseTo(0.24);
  });

  test("a normal attack is not raised", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party),
    ).toBe(0);
  });
});
