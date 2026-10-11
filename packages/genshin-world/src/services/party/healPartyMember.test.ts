import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { describe, expect, test } from "vitest";

describe(healPartyMember, () => {
  test("restores the share to a standing member, never above all of its HP, and records it with its overflow and healer", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    getPartyMember(party, 1).healthShare = 0.5;
    healPartyMember(party, 1, 0.75, 2);

    expect({ healthChanges: party.healthChanges, healthShare: getPartyMember(party, 1).healthShare }).toStrictEqual({
      healthChanges: [{ characterId: 1, healthShare: 0.5, overflowHealthShare: 0.25, sourceCharacterId: 2 }],
      healthShare: 1,
    });
  });

  test("leaves a downed member down and records nothing", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    getPartyMember(party, 1).healthShare = 0;
    healPartyMember(party, 1, 0.5);

    expect({ healthChanges: party.healthChanges, partyMember: getPartyMember(party, 1) }).toStrictEqual({
      healthChanges: [],
      partyMember: { ...createPartyMember(), healthShare: 0 },
    });
  });
});
