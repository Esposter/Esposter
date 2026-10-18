import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBoltOfPerceptionPassiveModule } from "#src/services/weapon/passives/createBoltOfPerceptionPassiveModule";
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
// Echo at its first rank: a 50% chance, the rank's bounce count (not modelled here), its multiplier and its cooldown
const boltOfPerceptionPassiveModule = createBoltOfPerceptionPassiveModule([0.5, 4, 2.4, 12]);
const createNormalAttackHit = () => ({
  attackTag: AttackTag.NormalAttack,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createBoltOfPerceptionPassiveModule, () => {
  test("a normal attack the wielder lands queues one bolt on the enemy it struck at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boltOfPerceptionPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.target).toBe(enemy);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(2.4);
  });

  test("a second attack inside the rank's cooldown queues no second bolt", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    boltOfPerceptionPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    boltOfPerceptionPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(context.strikes).toHaveLength(1);
  });
});
