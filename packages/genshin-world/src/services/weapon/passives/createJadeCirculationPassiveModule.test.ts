import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, readBuffTuples } from "#src/services/kit/createKitTestContext.test";
import { createJadeCirculationPassiveModule } from "#src/services/weapon/passives/createJadeCirculationPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { stepPassiveSeconds } from "#src/services/weapon/passives/stepPassiveSeconds.test";
import { describe, expect, test } from "vitest";

const readBuffs = (context: KitContext) => readBuffTuples(context.kitEffectState.effects);

describe(createJadeCirculationPassiveModule, () => {
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Jade Circulation at its first rank: off the field for more than five seconds, Max HP rises by 32% and Elemental
  // Mastery by 40, until the wielder has been on the field for ten seconds
  const passiveModule = createJadeCirculationPassiveModule([10, 5, 0.32, 40]);
  const createOffFieldContext = (): KitContext => createKitTestContext(wielder, { activeCombatant: other });
  const buffsUp = [
    [Attribute.HealthPercent, 0.32, Number.POSITIVE_INFINITY],
    [Attribute.ElementalMastery, 40, Number.POSITIVE_INFINITY],
  ];

  test("off the field for more than five seconds, Max HP and Elemental Mastery rise by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createOffFieldContext();
    stepPassiveSeconds(context, passiveModule, wielder, 5.5);

    expect(readBuffs(context)).toStrictEqual(buffsUp);
  });

  test("a return to the field before five seconds starts nothing, and the count begins again on leaving it", () => {
    expect.hasAssertions();

    const context = createOffFieldContext();
    stepPassiveSeconds(context, passiveModule, wielder, 4);
    context.activeCombatant = wielder;
    stepPassiveSeconds(context, passiveModule, wielder, 1.5);
    context.activeCombatant = other;
    stepPassiveSeconds(context, passiveModule, wielder, 4);

    expect(readBuffs(context)).toStrictEqual([]);
  });

  test("on the field for ten seconds cancels both, and the wielder's leaving the field starts them again", () => {
    expect.hasAssertions();

    const context = createOffFieldContext();
    stepPassiveSeconds(context, passiveModule, wielder, 5.5);
    context.activeCombatant = wielder;
    stepPassiveSeconds(context, passiveModule, wielder, 10.5);

    expect(readBuffs(context)).toStrictEqual([]);

    context.activeCombatant = other;
    stepPassiveSeconds(context, passiveModule, wielder, 5.5);

    expect(readBuffs(context)).toStrictEqual(buffsUp);
  });
});
