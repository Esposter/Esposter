import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { createParticleHealPassiveModule } from "#src/services/weapon/passives/createParticleHealPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const createParticleCollected = (characterId: number) => ({
  characterId,
  count: 2,
  energyDropKind: EnergyDropKind.Particle,
  kind: KitEventKind.EnergyParticleCollected as const,
});

describe(createParticleHealPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.Health, value: 1000 }]);
  // A synthetic tenth of Max HP for each particle or orb, not the weapon's row
  const particleHealPassiveModule = createParticleHealPassiveModule([0.1]);

  test("a particle the wielder collects restores its share of Max HP for each one collected", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    particleHealPassiveModule.onKitEvent?.(createParticleCollected(TRAVELER_CHARACTER_ID), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("a particle another character collects restores the wielder nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    particleHealPassiveModule.onKitEvent?.(createParticleCollected(OTHER_CHARACTER_ID), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.5);
  });
});
