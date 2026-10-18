import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createInfusionScrollPassiveModule } from "#src/services/weapon/passives/createInfusionScrollPassiveModule";
import { createWielderCombatant, getBuff } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const OTHER_CHARACTER_ID = 10_000_066;
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Infusion Scroll at its first rank, which reads its per-stack bonus from the affix row's first number
const infusionScrollPassiveModule = createInfusionScrollPassiveModule([0.08]);

const createReaction = (striker: Combatant) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element: Element.Pyro, reactionType: ReactionType.Melt }],
  striker,
});
describe(createInfusionScrollPassiveModule, () => {
  test("a reaction the wielder triggers gives every element its bonus at one stack", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionScrollPassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.08);
    expect(getBuff(kitEffectState, Attribute.HydroDamageBonus)?.amount).toBeCloseTo(0.08);
  });

  test("a second reaction stacks the bonus to two, and a third holds it there", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionScrollPassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);
    infusionScrollPassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.16);

    infusionScrollPassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)?.amount).toBeCloseTo(0.16);
  });

  test("a reaction another character triggers gives nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    const other: Combatant = { ...wielder, characterId: OTHER_CHARACTER_ID };
    infusionScrollPassiveModule.onKitEvent?.(createReaction(other), context, wielder);

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("the bonus ends ten seconds after its last reaction", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    infusionScrollPassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);
    stepKitSeconds(context, 10);

    expect(getBuff(kitEffectState, Attribute.PyroDamageBonus)).toBeUndefined();
  });
});
