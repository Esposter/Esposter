import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createEchoesOfThePlentifulLandPassiveModule } from "#src/services/weapon/passives/createEchoesOfThePlentifulLandPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const createSkillUsed = () => ({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed as const });

describe(createEchoesOfThePlentifulLandPassiveModule, () => {
  // Synthetic params: half a point of Normal Attack DMG for each thousand Max HP, up to two points, for three seconds
  const echoesOfThePlentifulLandPassiveModule = createEchoesOfThePlentifulLandPassiveModule([0.5, 2, 3]);

  test("an Elemental Skill raises Normal Attack DMG by the rank's share for each thousand Max HP", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 2000 }]);
    const context = createKitTestContext(wielder);
    echoesOfThePlentifulLandPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.NormalAttackDamageBonus],
    ).toBe(1);
  });

  test("the stacks count the wielder's Max HP after its buffs, not its base Max HP", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 1000 }]);
    const context = createKitTestContext(wielder, {
      kitEffectState: {
        effects: [
          {
            amount: 1000,
            attribute: Attribute.Health,
            characterId: TRAVELER_CHARACTER_ID,
            kind: "buff",
            secondsRemaining: 1,
          },
        ],
      },
    });
    echoesOfThePlentifulLandPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.NormalAttackDamageBonus],
    ).toBe(1);
  });

  test("only whole thousands of Max HP count toward the bonus", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 1999 }]);
    const context = createKitTestContext(wielder);
    echoesOfThePlentifulLandPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.NormalAttackDamageBonus],
    ).toBe(0.5);
  });

  test("the bonus stops at the rank's maximum", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 30000 }]);
    const context = createKitTestContext(wielder);
    echoesOfThePlentifulLandPassiveModule.onKitEvent?.(createSkillUsed(), context, wielder);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.NormalAttackDamageBonus],
    ).toBe(2);
  });

  test("a burst raises nothing", () => {
    expect.hasAssertions();

    const wielder = createWielderCombatant([{ attribute: Attribute.Health, value: 2000 }]);
    const context = createKitTestContext(wielder);
    echoesOfThePlentifulLandPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 0, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.NormalAttackDamageBonus],
    ).toBe(0);
  });
});
