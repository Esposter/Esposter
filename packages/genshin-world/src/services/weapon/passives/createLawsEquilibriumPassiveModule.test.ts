import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createLawsEquilibriumPassiveModule } from "#src/services/weapon/passives/createLawsEquilibriumPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant();
// Covenant of Frost and Snow with synthetic params: 100 Elemental Mastery for eight seconds after an Elemental Skill
const lawsEquilibriumPassiveModule = createLawsEquilibriumPassiveModule([100, 8, 0, 0]);

describe(createLawsEquilibriumPassiveModule, () => {
  test("the wielder's Elemental Skill raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    lawsEquilibriumPassiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 100,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "lawsEquilibrium",
      },
    ]);
  });
});
