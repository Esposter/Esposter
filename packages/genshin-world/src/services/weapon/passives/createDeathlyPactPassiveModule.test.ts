import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createDeathlyPactPassiveModule } from "#src/services/weapon/passives/createDeathlyPactPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createDeathlyPactPassiveModule, () => {
  // Deathly Pact with synthetic params: its CRIT DMG line is the table's, so its first param is not read here.
  // Each increase of the wielder's Bond of Life raises its DMG by 25% for three seconds, up to three stacks
  const deathlyPactPassiveModule = createDeathlyPactPassiveModule([0, 0.25, 3]);
  const wielder: Combatant = createWielderCombatant();
  const bondOfLifeIncreased = {
    bondOfLifeShare: 0.1,
    characterId: TRAVELER_CHARACTER_ID,
    healthShare: 0,
    isFallRefused: false,
    kind: KitEventKind.HealthChanged as const,
    overflowHealthShare: 0,
  };

  test("an increase of the wielder's Bond of Life raises its DMG by 25% for three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.25, attribute: Attribute.AllDamageBonus, secondsRemaining: 3 },
    ]);
  });

  test("each increase adds a stack, up to three", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let increase = 0; increase < 4; increase++)
      deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.75, attribute: Attribute.AllDamageBonus, secondsRemaining: 3 },
    ]);
  });

  test("the stacks end three seconds after the last increase", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.(bondOfLifeIncreased, context, wielder);
    stepKitSeconds(context, 3.1);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("a heal that adds no Bond of Life obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.({ ...bondOfLifeIncreased, bondOfLifeShare: 0 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("an increase of another character's Bond of Life obtains nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    deathlyPactPassiveModule.onKitEvent?.({ ...bondOfLifeIncreased, characterId: -1 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
