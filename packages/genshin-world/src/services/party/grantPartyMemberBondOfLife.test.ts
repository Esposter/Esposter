import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { grantPartyMemberBondOfLife } from "#src/services/party/grantPartyMemberBondOfLife";
import { describe, expect, test } from "vitest";

describe(grantPartyMemberBondOfLife, () => {
  test("a member with no Bond of Life carries the grant as its Bond of Life", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    grantPartyMemberBondOfLife(party, 1, 0.25);

    expect(getPartyMember(party, 1).bondOfLifeShare).toBe(0.25);
  });

  test("a grant over an empty Bond of Life restarts the share the bond has cleared", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const partyMember = getPartyMember(party, 1);
    partyMember.bondOfLifeClearedShare = 0.5;
    grantPartyMemberBondOfLife(party, 1, 0.25);

    expect({
      bondOfLifeClearedShare: partyMember.bondOfLifeClearedShare,
      bondOfLifeShare: partyMember.bondOfLifeShare,
    }).toStrictEqual({ bondOfLifeClearedShare: 0, bondOfLifeShare: 0.25 });
  });

  test("a grant adds to the Bond of Life a member already carries", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    getPartyMember(party, 1).bondOfLifeShare = 0.25;
    grantPartyMemberBondOfLife(party, 1, 0.25);

    expect(getPartyMember(party, 1).bondOfLifeShare).toBe(0.5);
  });
});
