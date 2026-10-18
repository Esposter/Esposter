import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { spendPartyMemberEnergy } from "#src/services/party/spendPartyMemberEnergy";
import { describe, expect, test } from "vitest";

describe(spendPartyMemberEnergy, () => {
  test("spends the energy a member holds as much of as it asks, and reports that it did", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    partyMember.energy = 15;

    expect(spendPartyMemberEnergy(party, TRAVELER_CHARACTER_ID, 15)).toBe(true);
    expect(partyMember.energy).toBe(0);
  });

  test("spends nothing, and reports that it did not, when the member holds less than it asks", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const partyMember = getPartyMember(party, TRAVELER_CHARACTER_ID);
    partyMember.energy = 14;

    expect(spendPartyMemberEnergy(party, TRAVELER_CHARACTER_ID, 15)).toBe(false);
    expect(partyMember.energy).toBe(14);
  });
});
