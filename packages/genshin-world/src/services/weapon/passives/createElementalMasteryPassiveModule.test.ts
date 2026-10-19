import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createElementalMasteryPassiveModule } from "#src/services/weapon/passives/createElementalMasteryPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
describe(createElementalMasteryPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Elemental Mastery with synthetic params: the elemental DMG percentage per stack and its seconds
  const elementalMasteryPassiveModule = createElementalMasteryPassiveModule([0.05, 3]);
  const createNormalAttackHit = () => ({
    attackTag: AttackTag.NormalAttack,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a normal attack hit raises every elemental DMG bonus by the rank's percentage at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.05);
    expect(getBuff(kitEffectState, Attribute.HydroDamageBonus)?.amount).toBeCloseTo(0.05);
  });

  test("a third normal attack hit holds the stacks at two", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    elementalMasteryPassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.1);
  });
});
