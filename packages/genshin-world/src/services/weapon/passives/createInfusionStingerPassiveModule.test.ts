import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createInfusionStingerPassiveModule } from "#src/services/weapon/passives/createInfusionStingerPassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Infusion Stinger with synthetic params: its All DMG Bonus per stack, its maximum stacks and its seconds
const infusionStingerPassiveModule = createInfusionStingerPassiveModule([0.05, 3, 5]);
const createEnemyHit = (element: Element | undefined) => ({
  element,
  enemy,
  kind: KitEventKind.EnemyHit as const,
  striker: wielder,
});
describe(createInfusionStingerPassiveModule, () => {
  test("a physical hit the wielder deals raises no all DMG stack", () => {
    expect.hasAssertions();
    const context = createKitTestContext(wielder);
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(undefined), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AllDamageBonus)).toBeUndefined();
  });

  test("an elemental hit the wielder deals raises all DMG by the rank's amount at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(Element.Pyro), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AllDamageBonus)?.amount).toBeCloseTo(0.05);
  });

  test("stacks hold at the rank's maximum of three, one each second", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(Element.Pyro), context, wielder);
    stepKitSeconds(context, 1.05);
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(Element.Pyro), context, wielder);
    stepKitSeconds(context, 1.05);
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(Element.Pyro), context, wielder);
    stepKitSeconds(context, 1.05);
    infusionStingerPassiveModule.onKitEvent?.(createEnemyHit(Element.Pyro), context, wielder);

    expect(getBuff(kitEffectState, Attribute.AllDamageBonus)?.amount).toBeCloseTo(0.15);
  });
});
