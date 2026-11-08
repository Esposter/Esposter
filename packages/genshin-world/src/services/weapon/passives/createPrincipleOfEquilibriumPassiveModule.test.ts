import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createPrincipleOfEquilibriumPassiveModule } from "#src/services/weapon/passives/createPrincipleOfEquilibriumPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

describe(createPrincipleOfEquilibriumPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: eight Energy for a heal the wielder performs, once every ten seconds
  const principleOfEquilibriumPassiveModule = createPrincipleOfEquilibriumPassiveModule([8, 10]);
  // A heal of another member the wielder performs, the source named as the wielder
  const healPerformed: KitEvent = {
    bondOfLifeShare: 0,
    characterId: TRAVELER_CHARACTER_ID + 1,
    healthShare: 0.5,
    isFallRefused: false,
    kind: KitEventKind.HealthChanged,
    overflowHealthShare: 0,
    sourceCharacterId: TRAVELER_CHARACTER_ID,
  };

  test("a heal the wielder performs restores the rank's Energy to it, even off the field", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    principleOfEquilibriumPassiveModule.onKitEvent?.(healPerformed, context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);
  });

  test("a heal the wielder only receives from another source restores nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    principleOfEquilibriumPassiveModule.onKitEvent?.(
      { ...healPerformed, characterId: TRAVELER_CHARACTER_ID, sourceCharacterId: TRAVELER_CHARACTER_ID + 1 },
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });
});
