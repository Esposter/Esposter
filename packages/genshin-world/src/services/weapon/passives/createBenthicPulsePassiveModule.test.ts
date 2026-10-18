import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createBenthicPulsePassiveModule } from "#src/services/weapon/passives/createBenthicPulsePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant();
// Song of Stillness, Benthic Pulse at its first rank: sixteen per cent more DMG for eight seconds after the wielder is healed
const benthicPulsePassiveModule = createBenthicPulsePassiveModule([0.16, 8, 0, 0]);
const healthGained: KitEvent = {
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0.5,
  bondOfLifeShare: 0,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
};

describe(createBenthicPulsePassiveModule, () => {
  test("a heal of the wielder raises its DMG by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    benthicPulsePassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.16,
        attribute: Attribute.AllDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "benthicPulse",
      },
    ]);
  });
});
