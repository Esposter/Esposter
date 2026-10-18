import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createParticleHealPassiveModule } from "#src/services/weapon/passives/createParticleHealPassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 10_000_066;
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: 1000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Journey at its first rank: one per cent of Max HP for each particle or orb
const particleHealPassiveModule = createParticleHealPassiveModule([0.01]);
const createParticleCollected = (characterId: number) => ({
  characterId,
  count: 2,
  energyDropKind: EnergyDropKind.Particle,
  kind: KitEventKind.EnergyParticleCollected as const,
});

describe(createParticleHealPassiveModule, () => {
  test("a particle the wielder collects restores its share of Max HP for each one collected", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    particleHealPassiveModule.onKitEvent?.(createParticleCollected(TRAVELER_CHARACTER_ID), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.52);
  });

  test("a particle another character collects restores the wielder nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.5);
    particleHealPassiveModule.onKitEvent?.(createParticleCollected(OTHER_CHARACTER_ID), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(0.5);
  });
});
