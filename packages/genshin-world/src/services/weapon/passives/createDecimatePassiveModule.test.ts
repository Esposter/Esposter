import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { AttackTag } from "#src/models/combat/AttackTag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createDecimatePassiveModule } from "#src/services/weapon/passives/createDecimatePassiveModule";
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
// Decimate at its first rank, which reads its DMG percentage from the affix row's first number
const decimatePassiveModule = createDecimatePassiveModule([0.4]);
const strike: KitStrike = {
  attackTag: AttackTag.NormalAttack,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
};

describe(createDecimatePassiveModule, () => {
  test("a strike on an automaton is raised by the rank's percentage", () => {
    expect.hasAssertions();

    expect(
      decimatePassiveModule.getStrikeDamageBonus?.(
        strike,
        { ...enemy, enemyFamily: EnemyFamily.Automatons },
        createParty([TRAVELER_CHARACTER_ID]),
      ),
    ).toBeCloseTo(0.4);
  });

  test("a strike on another family of enemy is not raised", () => {
    expect.hasAssertions();

    expect(
      decimatePassiveModule.getStrikeDamageBonus?.(
        strike,
        { ...enemy, enemyFamily: EnemyFamily.Hilichurls },
        createParty([TRAVELER_CHARACTER_ID]),
      ),
    ).toBe(0);
  });
});
