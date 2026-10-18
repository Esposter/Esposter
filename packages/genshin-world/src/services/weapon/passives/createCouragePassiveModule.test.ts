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
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createCouragePassiveModule } from "#src/services/weapon/passives/createCouragePassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Courage with a synthetic ATK percentage per stack, which is its only param
const couragePassiveModule = createCouragePassiveModule([0.05]);
const createNormalAttackHit = () => ({
  attackTag: AttackTag.NormalAttack,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});
describe(createCouragePassiveModule, () => {
  test("a normal attack hit raises ATK by the rank's percentage at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    couragePassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);
  });

  test("a hit inside the rank's half-second cooldown adds no stack, and one after it stacks to two", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    couragePassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);
    couragePassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);

    stepKitSeconds(context, 0.55);
    couragePassiveModule.onKitEvent?.(createNormalAttackHit(), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.1);
  });
});
