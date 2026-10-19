import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createSkillBuffPassiveModule } from "#src/services/weapon/passives/createSkillBuffPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

describe(createSkillBuffPassiveModule, () => {
  const wielder = createWielderCombatant();

  // Busybody's Running Light at its first rank: 20% ATK and 10% Movement SPD for ten seconds after an Elemental Skill
  const passiveModule = createSkillBuffPassiveModule([0.2, 0.1, 10], {
    attributes: [Attribute.AttackPercent, Attribute.MovementSpeed],
    source: "busybodysRunningLight",
  });

  test("the wielder's Elemental Skill raises each attribute by its amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "busybodysRunningLight",
      },
      {
        amount: 0.1,
        attribute: Attribute.MovementSpeed,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "busybodysRunningLight",
      },
    ]);
  });

  test("another member's Elemental Skill raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: OTHER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
