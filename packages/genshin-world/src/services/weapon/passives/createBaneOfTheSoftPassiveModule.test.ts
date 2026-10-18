import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createBaneOfTheSoftPassiveModule } from "#src/services/weapon/passives/createBaneOfTheSoftPassiveModule";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
const strike: KitStrike = {
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits),
};
const party = createParty([TRAVELER_CHARACTER_ID]);
// Bane of the Soft at its first rank, which reads its DMG percentage from the affix row's first number
const baneOfTheSoftPassiveModule = createBaneOfTheSoftPassiveModule([0.4]);

describe(createBaneOfTheSoftPassiveModule, () => {
  test("a strike on a slime is raised by the rank's percentage", () => {
    expect.hasAssertions();

    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), enemyKindId: EnemyKindId.AnemoSlime };

    expect(baneOfTheSoftPassiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBeCloseTo(0.4);
  });

  test("a strike on another kind of enemy is not raised", () => {
    expect.hasAssertions();

    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), enemyKindId: EnemyKindId.HilichurlFighter };

    expect(baneOfTheSoftPassiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBe(0);
  });
});
