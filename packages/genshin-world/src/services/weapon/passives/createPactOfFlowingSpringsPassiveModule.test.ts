import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createPactOfFlowingSpringsPassiveModule } from "#src/services/weapon/passives/createPactOfFlowingSpringsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant();
// Footprint of the Rainbow at its first rank: sixteen per cent DEF for fifteen seconds after an Elemental Skill
const pactOfFlowingSpringsPassiveModule = createPactOfFlowingSpringsPassiveModule([0.16, 15, 0, 0]);

describe(createPactOfFlowingSpringsPassiveModule, () => {
  test("the wielder's Elemental Skill raises its DEF by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    pactOfFlowingSpringsPassiveModule.onKitEvent?.(
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
        source: "pactOfFlowingSprings",
      },
    ]);
  });
});
