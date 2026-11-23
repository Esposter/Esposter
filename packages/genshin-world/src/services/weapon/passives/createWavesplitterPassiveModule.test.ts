import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createWavesplitterPassiveModule } from "#src/services/weapon/passives/createWavesplitterPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { stepPassiveSeconds } from "#src/services/weapon/passives/stepPassiveSeconds.test";
import { describe, expect, test } from "vitest";

describe(createWavesplitterPassiveModule, () => {
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Wavesplitter at its first rank: every four seconds on the field the wielder gains a stack, dealing 6% more DMG and
  // Taking 3% more DMG a stack, up to five. A DMG taken takes one stack away
  const passiveModule = createWavesplitterPassiveModule([4, 0.06, 0.03]);
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects) ?? [];
  const takeDamage = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.1,
        healthShareBefore: 1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      wielder,
    );

  test("on the field, each four seconds adds a stack, raising DMG dealt and DMG taken by the rank's share a stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    stepPassiveSeconds(context, passiveModule, wielder, 8.5);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 0.12, attribute: Attribute.AllDamageBonus },
      { amount: -0.06, attribute: Attribute.DamageReduction },
    ]);
  });

  test("the stacks stay when the wielder leaves the field, and no tick counts while she is away", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    stepPassiveSeconds(context, passiveModule, wielder, 8.5);
    context.activeCombatant = other;
    stepPassiveSeconds(context, passiveModule, wielder, 20);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 0.12, attribute: Attribute.AllDamageBonus },
      { amount: -0.06, attribute: Attribute.DamageReduction },
    ]);

    context.activeCombatant = wielder;
    stepPassiveSeconds(context, passiveModule, wielder, 4);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 0.18, attribute: Attribute.AllDamageBonus },
      { amount: -0.09, attribute: Attribute.DamageReduction },
    ]);
  });

  test("a DMG taken by the wielder takes one stack away, and the stacks are at most five", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    stepPassiveSeconds(context, passiveModule, wielder, 25);
    takeDamage(context);

    expect(readBonuses(context)).toStrictEqual([
      { amount: 0.24, attribute: Attribute.AllDamageBonus },
      { amount: -0.12, attribute: Attribute.DamageReduction },
    ]);
  });
});
