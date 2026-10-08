import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(damagePartyMember, () => {
  test("takes the share from its HP and leaves it standing", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    damagePartyMember(party, 1, 0.25);

    expect(getPartyMember(party, 1)).toStrictEqual({ ...createPartyMember(), healthShare: 0.75 });
  });

  test("downs a member whose HP runs out, empties its energy and brings on the next member standing after it", () => {
    expect.hasAssertions();

    const party = createParty([1, 2, 3]);
    party.characterIdMemberMap.set(2, { ...createPartyMember(), healthShare: 0 });
    getPartyMember(party, 1).energy = 1;
    damagePartyMember(party, 1, 2);

    expect({ activeIndex: party.activeIndex, partyMember: getPartyMember(party, 1) }).toStrictEqual({
      activeIndex: 2,
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
