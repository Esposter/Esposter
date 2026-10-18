import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createSmokeAndMirrorMysteryPassiveModule } from "#src/services/weapon/passives/createSmokeAndMirrorMysteryPassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const wielder: Combatant = createWielderCombatant();
// Flute of Ezpitzal at its first rank: sixteen per cent DEF for fifteen seconds after an Elemental Skill
const smokeAndMirrorMysteryPassiveModule = createSmokeAndMirrorMysteryPassiveModule([0.16, 15, 0, 0]);

describe(createSmokeAndMirrorMysteryPassiveModule, () => {
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
        amount: 0.16,
        attribute: Attribute.DefensePercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15,
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
