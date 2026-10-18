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
import { createUndyingAdmirationPassiveModule } from "#src/services/weapon/passives/createUndyingAdmirationPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const party = createParty([TRAVELER_CHARACTER_ID]);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Undying Admiration at its first rank: sixteen per cent DMG and six per cent CRIT Rate for an Elemental Skill
const undyingAdmirationPassiveModule = createUndyingAdmirationPassiveModule([0.16, 0.06]);
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});

describe(createUndyingAdmirationPassiveModule, () => {
  test("an elemental skill's strike gains the rank's DMG Bonus, and a normal attack's gains none", () => {
    expect.hasAssertions();

    expect(
      undyingAdmirationPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, []),
    ).toBe(0.16);
    expect(
      undyingAdmirationPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("an elemental skill's strike gains the rank's CRIT Rate, and a normal attack's gains none", () => {
    expect.hasAssertions();

    expect(
      undyingAdmirationPassiveModule.getStrikeCriticalRateBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        party,
        [],
      ),
    ).toBe(0.06);
    expect(
      undyingAdmirationPassiveModule.getStrikeCriticalRateBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        party,
        [],
      ),
    ).toBe(0);
  });
});
