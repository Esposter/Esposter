import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBluntConclusionPassiveModule } from "#src/services/weapon/passives/createBluntConclusionPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Blunt Conclusion with synthetic params: the multiplier, the seconds it lasts after a skill and its cooldown
const bluntConclusionPassiveModule = createBluntConclusionPassiveModule([0.5, 2, 3]);
const createNormalAttackHit = () => ({
  attackTag: AttackTag.NormalAttack,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});

describe(createBluntConclusionPassiveModule, () => {
  test("a normal attack after the wielder's skill queues one extra hit at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bluntConclusionPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      context,
      wielder,
    );
    bluntConclusionPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBeCloseTo(0.5);
  });

  test("a normal attack with no skill before it queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bluntConclusionPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });
});
