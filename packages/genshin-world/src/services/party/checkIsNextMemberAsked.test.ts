import { checkIsNextMemberAsked } from "#src/services/party/checkIsNextMemberAsked";
import { PARTY_FALL_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { stepPartyFall } from "#src/services/party/stepPartyFall";
import { switchPartyMember } from "#src/services/party/switchPartyMember";
import { describe, expect, test } from "vitest";

describe(checkIsNextMemberAsked, () => {
  test("the player chooses the next member after a fall", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 1, 1);
    const duringFall = checkIsNextMemberAsked(party);
    stepPartyFall(party, PARTY_FALL_SECONDS);
    const afterFall = checkIsNextMemberAsked(party);
    switchPartyMember(party, 1, 10);

    expect([duringFall, afterFall, checkIsNextMemberAsked(party)]).toStrictEqual([false, true, false]);
  });

  test("nobody standing is the game over rather than a choice", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    damagePartyMember(party, 1, 1);
    damagePartyMember(party, 2, 1);
    stepPartyFall(party, PARTY_FALL_SECONDS);

    expect(checkIsNextMemberAsked(party)).toBe(false);
  });
});
