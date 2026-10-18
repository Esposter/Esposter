import type { Combatant } from "#src/models/kit/Combatant";
import type { KitShield } from "#src/models/kit/KitShield";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(hitPartyMember, () => {
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

  test("should lose the share of max HP the shields do not absorb", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const shield: KitShield = { characterId: 2, health: 50, kind: "shield", secondsRemaining: 10 };

    hitPartyMember(party, combatant, { effects: [shield] }, 100);

    expect(shield.health).toBe(0);
    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - 50 / MAX_HEALTH);
  });

  test("should lose the whole hit's share of max HP with no shield up", () => {
    expect.hasAssertions();

    const party = createParty([1]);

    hitPartyMember(party, combatant, { effects: [] }, 100);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - 100 / MAX_HEALTH);
  });
});
