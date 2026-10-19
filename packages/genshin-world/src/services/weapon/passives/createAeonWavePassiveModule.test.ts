import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createAeonWavePassiveModule } from "#src/services/weapon/passives/createAeonWavePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const readBuffs = (effects: readonly KitEffect[]) =>
  effects
    .filter((effect) => effect.kind === "buff")
    .map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining }));

describe(createAeonWavePassiveModule, () => {
  // Aeon Wave with synthetic params: each change in the wielder's HP adds 0.2 Charged Attack DMG for two seconds, up to
  // Three stacks once every 0.25 seconds, and a third stack restores 2 energy once every three seconds.
  const aeonWavePassiveModule = createAeonWavePassiveModule([2, 0.25, 0.2, 2, 3]);
  const wielder: Combatant = createWielderCombatant();
  const healthChanged = {
    bondOfLifeShare: 0,
    characterId: TRAVELER_CHARACTER_ID,
    healthShare: 0.1,
    isFallRefused: false,
    kind: KitEventKind.HealthChanged as const,
    overflowHealthShare: 0,
  };

  test("a change in the wielder's HP adds a stack of Charged Attack DMG for two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 2 },
    ]);
  });

  test("a change within the stack's cooldown adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
    aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.ChargedAttackDamageBonus, secondsRemaining: 2 },
    ]);
  });

  test("a third stack restores the wielder's energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(2);
  });

  test("the energy is restored once every three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }
    stepKitSeconds(context, 3.1);
    for (let change = 0; change < 3; change++) {
      aeonWavePassiveModule.onKitEvent?.(healthChanged, context, wielder);
      stepKitSeconds(context, 0.5);
    }

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);
  });

  test("a change in another character's HP adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    aeonWavePassiveModule.onKitEvent?.({ ...healthChanged, characterId: -1 }, context, wielder);

    expect(readBuffs(context.kitEffectState.effects)).toStrictEqual([]);
  });
});
