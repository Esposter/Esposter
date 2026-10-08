import { checkIsPartyDown } from "#src/services/party/checkIsPartyDown";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { describe, expect, test } from "vitest";

describe(checkIsPartyDown, () => {
  test("holds only once every member of the deployed team is down", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 1, 1);
    const isOneDown = checkIsPartyDown(party);
    damagePartyMember(party, 2, 1);

    expect([isOneDown, checkIsPartyDown(party)]).toStrictEqual([false, true]);
  });
});
