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
import { createInfusionArrowPassiveModule } from "#src/services/weapon/passives/createInfusionArrowPassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Infusion Arrow with synthetic params, which reads its ATK and Normal ATK SPD per stack from the first two numbers
const infusionArrowPassiveModule = createInfusionArrowPassiveModule([0.05, 0.02, 0.2]);
const createDamageTaken = (attackTag: AttackTag) => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken as const,
  striker: wielder,
});
describe(createInfusionArrowPassiveModule, () => {
  test("a normal attack hit raises ATK and Normal ATK SPD by the rank's numbers at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionArrowPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);
    expect(getBuff(kitEffectState, Attribute.NormalAttackSpeed)?.amount).toBeCloseTo(0.02);
  });

  test("a charged attack hit stacks the same as a normal attack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionArrowPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);
  });
});
