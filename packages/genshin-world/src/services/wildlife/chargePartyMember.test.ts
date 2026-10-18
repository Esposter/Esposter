import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { chargePartyMember } from "#src/services/wildlife/chargePartyMember";
import { WILDLIFE_CHARGE_DAMAGE } from "#src/services/wildlife/constants";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(chargePartyMember, () => {
  const MAX_HEALTH = 1000;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: MAX_HEALTH }]),
    characterId: 1,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("a boar's charge takes its share of the member's Max HP", () => {
    expect.hasAssertions();

    const party = createParty([1]);

    chargePartyMember(party, combatant, { effects: [] });

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - WILDLIFE_CHARGE_DAMAGE);
  });
});
