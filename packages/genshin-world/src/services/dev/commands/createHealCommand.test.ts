import { createHealCommand } from "#src/services/dev/commands/createHealCommand";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(createHealCommand, () => {
  test("restores every member on the deployed team to full HP and counts them", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    getPartyMember(party, 1).healthShare = 0.5;
    const result = createHealCommand({ party }).run({});

    expect({ healthShare: getPartyMember(party, 1).healthShare, result }).toStrictEqual({
      healthShare: 1,
      result: { ok: true, value: 2 },
    });
  });
});
