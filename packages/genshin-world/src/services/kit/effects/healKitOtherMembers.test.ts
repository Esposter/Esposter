import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { SIGEWINNE_CHARACTER_ID } from "#src/services/kit/characters/sigewinneKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { healKitOtherMembers } from "#src/services/kit/effects/healKitOtherMembers";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const SIGEWINNE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SIGEWINNE_CHARACTER_ID);
const MEMBER_ID = 10_000_032;

const createCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: SIGEWINNE_KIT,
  level: 90,
});

describe(healKitOtherMembers, () => {
  test("a bubble's heal restores each other deployed member by the HP given, and not its healer", () => {
    expect.hasAssertions();
    const healer = createCombatant(SIGEWINNE_CHARACTER_ID);
    const member = createCombatant(MEMBER_ID);
    const context = createKitTestContext(healer, {
      characterIdCombatantMap: new Map([
        [healer.characterId, healer],
        [member.characterId, member],
      ]),
      party: createParty([healer.characterId, member.characterId]),
    });
    getPartyMember(context.party, healer.characterId).healthShare = 0.5;
    getPartyMember(context.party, member.characterId).healthShare = 0.5;
    healKitOtherMembers(context, healer, 1000);
    expect(getPartyMember(context.party, member.characterId).healthShare).toBeCloseTo(0.6);
    expect(getPartyMember(context.party, healer.characterId).healthShare).toBe(0.5);
  });
});
