import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createHonedFlowPassiveModule } from "#src/services/weapon/passives/createHonedFlowPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

// The stacks a character's Wavespike holds, read from the status that counts them
const getWavespikeStacks = (effects: readonly KitEffect[]) =>
  effects.find((effect): effect is KitStatus => effect.kind === "status" && effect.stacks !== undefined)?.stacks;

describe(createHonedFlowPassiveModule, () => {
  const wielder = createWielderCombatant();
  // Honed Flow at its first rank: 12% All Elemental DMG Bonus, two Wavespike stacks at most once every 0.3 seconds, and each
  // Stack consumed by the wielder's Elemental Skill raises its Normal Attack DMG by 20% for eight seconds
  const passiveModule = createHonedFlowPassiveModule([0.12, 2, 0.3, 0.2, 8]);
  const otherUsesSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: OTHER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

  test("its All Elemental DMG Bonus is a passive bonus on each element", () => {
    expect.hasAssertions();

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual(
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })),
    );
  });

  test("another member's Elemental Skill adds a Wavespike stack once every 0.3 seconds, and two stacks are the most", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    otherUsesSkill(context);
    otherUsesSkill(context);

    expect(getWavespikeStacks(context.kitEffectState.effects)).toBe(1);

    stepKitSeconds(context, 0.35);
    otherUsesSkill(context);
    stepKitSeconds(context, 0.35);
    otherUsesSkill(context);

    expect(getWavespikeStacks(context.kitEffectState.effects)).toBe(2);
  });

  test("the wielder's Elemental Skill consumes the stacks into Rippling Upheaval, 20% Normal Attack DMG a stack for eight seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    otherUsesSkill(context);
    stepKitSeconds(context, 0.35);
    otherUsesSkill(context);
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(getWavespikeStacks(context.kitEffectState.effects)).toBeUndefined();
    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([[Attribute.NormalAttackDamageBonus, 0.4, 8]]);
  });
});
