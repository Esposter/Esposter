import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { changeKitSkillCooldown } from "#src/services/kit/effects/changeKitSkillCooldown";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(changeKitSkillCooldown, () => {
  test("cuts a skill's running cooldown by the seconds given, and ends it at zero", () => {
    expect.hasAssertions();
    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 3;

    changeKitSkillCooldown(party, TRAVELER_CHARACTER_ID, -1.2);

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(1.8);

    changeKitSkillCooldown(party, TRAVELER_CHARACTER_ID, -5);

    expect(partyMember.skillCooldownSeconds).toBe(0);
  });
});
