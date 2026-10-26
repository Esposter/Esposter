import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createFrostBurialPassiveModule } from "#src/services/weapon/passives/createFrostBurialPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// An enemy under the aura given, or under none
const createEnemyUnder = (auraType?: AuraType) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  if (auraType !== undefined) enemy.elementalState.auras.set(auraType, { decayRate: 0, gauge: 1, isImmutable: false });
  return enemy;
};

describe(createFrostBurialPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // Frost Burial with a certain chance, synthetic multipliers and a ten-second cooldown
  const frostBurialPassiveModule = createFrostBurialPassiveModule([1, 0.8, 2, 10]);
  const createDamageTaken = (enemy = createEnemyUnder(), attackTag: AttackTag = AttackTag.NormalAttack) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a normal attack hit on an enemy not under Cryo queues the icicle at the rank's multiplier on that enemy", () => {
    expect.hasAssertions();

    const enemy = createEnemyUnder();
    const context = createKitTestContext(wielder);
    frostBurialPassiveModule.onKitEvent?.(createDamageTaken(enemy), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.target).toBe(enemy);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.8);
  });

  test("a hit on an enemy under Cryo queues the icicle at the rank's Cryo multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    frostBurialPassiveModule.onKitEvent?.(createDamageTaken(createEnemyUnder(AuraType.Cryo)), context, wielder);

    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(2);
  });

  test("a hit inside the rank's cooldown queues no second icicle, and an elemental skill queues none", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    frostBurialPassiveModule.onKitEvent?.(createDamageTaken(), context, wielder);
    frostBurialPassiveModule.onKitEvent?.(createDamageTaken(), context, wielder);

    expect(context.strikes).toHaveLength(1);

    const skillContext = createKitTestContext(wielder);
    frostBurialPassiveModule.onKitEvent?.(
      createDamageTaken(undefined, AttackTag.ElementalSkill),
      skillContext,
      wielder,
    );

    expect(skillContext.strikes).toHaveLength(0);
  });
});
