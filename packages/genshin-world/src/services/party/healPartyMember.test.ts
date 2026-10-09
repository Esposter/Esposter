import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";
import { describe, expect, test } from "vitest";

describe(healPartyMember, () => {
  test("restores the share to a standing member, never above all of its HP", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    getPartyMember(party, 1).healthShare = 0.5;
    healPartyMember(party, 1, 0.75);

    expect(getPartyMember(party, 1).healthShare).toBe(1);
  });

  test("leaves a downed member down", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    getPartyMember(party, 1).healthShare = 0;
    healPartyMember(party, 1, 0.5);

    expect(getPartyMember(party, 1)).toStrictEqual({ ...createPartyMember(), healthShare: 0 });
  });
});
