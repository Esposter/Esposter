import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createOppidanAmbushPassiveModule } from "#src/services/weapon/passives/createOppidanAmbushPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { stepPassiveSeconds } from "#src/services/weapon/passives/stepPassiveSeconds.test";
import { describe, expect, test } from "vitest";

describe(createOppidanAmbushPassiveModule, () => {
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Oppidan Ambush at its first rank: off the field, DMG rises by 2% a second up to 20%. On the field for more than four
  // Seconds, it falls by 4% a second until none
  const passiveModule = createOppidanAmbushPassiveModule([0.02, 4]);
  // The DMG Bonus the wielder's buff raises, zero while none is raised
  const readDamageBonus = (context: KitContext) =>
    context.kitEffectState.effects.find(
      (effect) => effect.kind === "buff" && effect.characterId === wielder.characterId,
    )?.amount ?? 0;

  test("off the field, DMG rises by the rank's amount each second, up to ten steps of it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { activeCombatant: other });
    stepPassiveSeconds(context, passiveModule, wielder, 5);

    expect(readDamageBonus(context)).toBeCloseTo(0.1);

    stepPassiveSeconds(context, passiveModule, wielder, 10);

    expect(readDamageBonus(context)).toBeCloseTo(0.2);
    expect(context.kitEffectState.effects.find((effect) => effect.kind === "buff")?.attribute).toBe(
      Attribute.AllDamageBonus,
    );
  });

  test("on the field, it holds for four seconds and then falls by twice the rate a second", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { activeCombatant: other });
    stepPassiveSeconds(context, passiveModule, wielder, 10);
    context.activeCombatant = wielder;
    stepPassiveSeconds(context, passiveModule, wielder, 3.9);

    expect(readDamageBonus(context)).toBeCloseTo(0.2);

    stepPassiveSeconds(context, passiveModule, wielder, 0.6);

    expect(readDamageBonus(context)).toBeCloseTo(0.18, 2);
  });

  test("on the field until it runs out, the DMG falls to none and stays there", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { activeCombatant: other });
    stepPassiveSeconds(context, passiveModule, wielder, 10);
    context.activeCombatant = wielder;
    stepPassiveSeconds(context, passiveModule, wielder, 12);

    expect(readDamageBonus(context)).toBe(0);
  });
});
