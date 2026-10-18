import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createTipOfTheSpearPassiveModule } from "#src/services/weapon/passives/createTipOfTheSpearPassiveModule";
import { describe, expect, test } from "vitest";

const wielder: Combatant = createWielderCombatant();
// Synthetic params, not the weapon's row: three Energy for a heal of the wielder, once every two seconds
const tipOfTheSpearPassiveModule = createTipOfTheSpearPassiveModule([3, 2, 0, 0]);
const healthGained: KitEvent = {
  characterId: TRAVELER_CHARACTER_ID,
  healthShare: 0.5,
  bondOfLifeShare: 0,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
};

describe(createTipOfTheSpearPassiveModule, () => {
  test("a heal of the wielder restores the rank's Energy to it, even off the field", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(3);
  });

  test("a second heal inside the two-second cooldown restores nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(3);

    stepKitSeconds(context, 2.5);
    tipOfTheSpearPassiveModule.onKitEvent?.(healthGained, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(6);
  });
});
