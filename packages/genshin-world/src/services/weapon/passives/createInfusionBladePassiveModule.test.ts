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
import { createInfusionBladePassiveModule } from "#src/services/weapon/passives/createInfusionBladePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
describe(createInfusionBladePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Infusion Blade with synthetic params, which reads its per-stack percentage from the first number
  const infusionBladePassiveModule = createInfusionBladePassiveModule([0.05]);
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a normal attack hit raises ATK and DEF by the rank's percentage at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionBladePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);
    expect(getBuff(kitEffectState, Attribute.DefensePercent)?.amount).toBeCloseTo(0.05);
  });

  test("a hit inside the rank's half-second cooldown adds no stack, and one after it stacks to two", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionBladePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    stepKitSeconds(context, 0.45);
    infusionBladePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.05);

    stepKitSeconds(context, 0.1);
    infusionBladePassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.1);
  });
});
