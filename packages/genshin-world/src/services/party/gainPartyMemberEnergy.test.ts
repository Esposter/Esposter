import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: 1.5 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(gainPartyMemberEnergy, () => {
  test("gives a passive's flat energy grant unraised by the member's energy recharge", () => {
    expect.hasAssertions();
    const party = createParty([TRAVELER_CHARACTER_ID]);
    gainPartyMemberEnergy(party, createCombatant(), 2);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(2);
  });

  test("stops a passive's flat energy grant at the burst's cost", () => {
    expect.hasAssertions();
    const party = createParty([TRAVELER_CHARACTER_ID]);
    gainPartyMemberEnergy(party, createCombatant(), TRAVELER_KIT.burstEnergyCost + 1);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(TRAVELER_KIT.burstEnergyCost);
  });
});
