import { DROWN_HEALTH_SHARE_LOSS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { drownParty } from "#src/services/party/drownParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(drownParty, () => {
  test("takes every member's energy and a share of its HP, downing one it takes the last of", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    party.characterIdMemberMap.set(1, { ...createPartyMember(), energy: 1 });
    party.characterIdMemberMap.set(2, { ...createPartyMember(), healthShare: DROWN_HEALTH_SHARE_LOSS });
    drownParty(party);

    expect([getPartyMember(party, 1), getPartyMember(party, 2)]).toStrictEqual([
      { ...createPartyMember(), healthShare: 1 - DROWN_HEALTH_SHARE_LOSS },
      { ...createPartyMember(), healthShare: 0 },
    ]);
  });
});
