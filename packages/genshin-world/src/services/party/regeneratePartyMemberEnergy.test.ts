import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { regeneratePartyMemberEnergy } from "#src/services/party/regeneratePartyMemberEnergy";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createCombatant = (attributes = computeCharacterAttributes([])): Combatant => ({
  ascension: 0,
  attributes,
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Anemo,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(regeneratePartyMemberEnergy, () => {
  test("raises a passive's energy regeneration by the member's energy recharge", () => {
    expect.hasAssertions();
    const combatant = createCombatant(
      computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: 1.5 }]),
    );
    const party = createParty([TRAVELER_CHARACTER_ID]);
    regeneratePartyMemberEnergy(party, combatant, 2);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(
      2 * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
    );
  });
});
