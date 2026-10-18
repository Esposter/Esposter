import { createParty } from "#src/services/party/createParty";
import { endPartyMemberSkillCooldown } from "#src/services/party/endPartyMemberSkillCooldown";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(endPartyMemberSkillCooldown, () => {
  test("ends the member's skill cooldown and leaves the other members' running", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    getPartyMember(party, 1).skillCooldownSeconds = 5;
    getPartyMember(party, 2).skillCooldownSeconds = 5;
    endPartyMemberSkillCooldown(party, 1);

    expect([
      getPartyMember(party, 1).skillCooldownSeconds,
      getPartyMember(party, 2).skillCooldownSeconds,
    ]).toStrictEqual([0, 5]);
  });
});
