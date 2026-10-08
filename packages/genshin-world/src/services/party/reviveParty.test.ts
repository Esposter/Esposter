import { REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { reviveParty } from "#src/services/party/reviveParty";
import { describe, expect, test } from "vitest";

describe(reviveParty, () => {
  test("brings back only the members who are down, at the revive's share", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 1, 1);
    damagePartyMember(party, 2, 0.5);
    reviveParty(party);

    expect([getPartyMember(party, 1).healthShare, getPartyMember(party, 2).healthShare]).toStrictEqual([
      REVIVE_HEALTH_SHARE,
      0.5,
    ]);
  });
});
