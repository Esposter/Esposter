import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createSmokeAndMirrorMysteryPassiveModule } from "#src/services/weapon/passives/createSmokeAndMirrorMysteryPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

describe(createSmokeAndMirrorMysteryPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // A synthetic DEF raise of a fifth for three seconds after an Elemental Skill, not the weapon's row
  const smokeAndMirrorMysteryPassiveModule = createSmokeAndMirrorMysteryPassiveModule([0.2, 3, 0, 0]);

  test("the wielder's Elemental Skill raises its DEF by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    smokeAndMirrorMysteryPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.DefensePercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "smokeAndMirrorMystery",
      },
    ]);
  });

  test("another character's Elemental Skill raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    smokeAndMirrorMysteryPassiveModule.onKitEvent?.(
      { characterId: OTHER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
