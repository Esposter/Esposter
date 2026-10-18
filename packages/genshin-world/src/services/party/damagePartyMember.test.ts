import { PARTY_FALL_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(damagePartyMember, () => {
  test("takes the share from its HP, leaves it standing and records the loss", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    damagePartyMember(party, 1, 0.25);

    expect({ healthChanges: party.healthChanges, partyMember: getPartyMember(party, 1) }).toStrictEqual({
      healthChanges: [{ characterId: 1, healthShare: -0.25, overflowHealthShare: 0 }],
      partyMember: { ...createPartyMember(), healthShare: 0.75 },
    });
  });

  test("downs a member whose HP runs out, empties its energy and starts the fall of the member on the field", () => {
    expect.hasAssertions();

    const party = createParty([1, 2, 3]);
    getPartyMember(party, 1).energy = 1;
    damagePartyMember(party, 1, 1);

    expect({
      activeIndex: party.activeIndex,
      fallSecondsRemaining: party.fallSecondsRemaining,
      partyMember: getPartyMember(party, 1),
    }).toStrictEqual({
      activeIndex: 0,
      fallSecondsRemaining: PARTY_FALL_SECONDS,
      partyMember: { ...createPartyMember(), healthShare: 0 },
    });
  });

  test("leaves the field where it is when a member off the field falls", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 2, 1);

    expect(party.activeIndex).toBe(0);
  });
});
