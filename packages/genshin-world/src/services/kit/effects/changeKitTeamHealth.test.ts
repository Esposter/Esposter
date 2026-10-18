import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { changeKitTeamHealth } from "#src/services/kit/effects/changeKitTeamHealth";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const NOELLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NOELLE_CHARACTER_ID);

const MEMBER_ID = 10_000_032;
const createCombatant = (characterId: number, maxHealth: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: maxHealth }]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: NOELLE_KIT,
  level: 90,
});

describe(changeKitTeamHealth, () => {
  test("heals each member of the deployed team by the amount, each over its own Max HP", () => {
    expect.hasAssertions();
    const source = createCombatant(NOELLE_CHARACTER_ID, 10_000);
    const member = createCombatant(MEMBER_ID, 20_000);
    const party = createParty([NOELLE_CHARACTER_ID, MEMBER_ID]);
    for (const characterId of [NOELLE_CHARACTER_ID, MEMBER_ID]) getPartyMember(party, characterId).healthShare = 0.5;

    changeKitTeamHealth(
      createKitTestContext(source, {
        characterIdCombatantMap: new Map([
          [MEMBER_ID, member],
          [NOELLE_CHARACTER_ID, source],
        ]),
        party,
      }),
      source,
      1000,
    );

    expect(getPartyMember(party, NOELLE_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + 1000 / 10_000, 5);
    expect(getPartyMember(party, MEMBER_ID).healthShare).toBeCloseTo(0.5 + 1000 / 20_000, 5);
  });
});
