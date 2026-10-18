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
import { createPrecisePassiveModule } from "#src/services/weapon/passives/createPrecisePassiveModule";
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
// Precise at its first rank, which reads its DMG percentage from the affix row's first number
const precisePassiveModule = createPrecisePassiveModule([0.24]);
const createStrike = (weakPoint: boolean): KitStrike => ({
  attackTag: AttackTag.ChargedAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: { ...TRAVELER_KIT.plungeCollision, weakPoint },
});

describe(createPrecisePassiveModule, () => {
  test("a strike on a weak point is raised by the rank's percentage", () => {
    expect.hasAssertions();

    expect(
      precisePassiveModule.getStrikeDamageBonus?.(createStrike(true), enemy, createParty([TRAVELER_CHARACTER_ID]), []),
    ).toBeCloseTo(0.24);
  });

  test("a strike off a weak point is not raised", () => {
    expect.hasAssertions();

    expect(
      precisePassiveModule.getStrikeDamageBonus?.(createStrike(false), enemy, createParty([TRAVELER_CHARACTER_ID]), []),
    ).toBe(0);
  });
});
