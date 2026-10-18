import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createCrushPassiveModule } from "#src/services/weapon/passives/createCrushPassiveModule";
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
// Crush at its first rank: a chance of an extra hit at the rank's multiplier, once every fifteen seconds
const crushPassiveModule = createCrushPassiveModule([0.5, 2.4]);
const createDamageTaken = (attackTag: AttackTag) => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createCrushPassiveModule, () => {
  test("a normal attack within the rank's chance queues one extra hit at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(2.4);
  });

  test("a roll above the rank's chance queues no extra hit", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.9 });
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second proc waits out the rank's fifteen seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);

    // A step clears the strikes queued before it, so each count below is the hits queued since the last step
    stepKitSeconds(context, 14);
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);

    stepKitSeconds(context, 1.1);
    crushPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
  });
});
