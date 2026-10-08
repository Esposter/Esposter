import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { createParty } from "#src/services/party/createParty";
import { deployPartyTeam } from "#src/services/party/deployPartyTeam";
import { describe, expect, test } from "vitest";

describe(deployPartyTeam, () => {
  test("deploys a team with its first member standing on the field", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.teams[1] = { characterIds: [2, 3], name: "" };
    party.fallenCharacterIds.push(2);
    const result = deployPartyTeam(party, 1);

    expect({ activeIndex: party.activeIndex, deployedTeamIndex: party.deployedTeamIndex, result }).toStrictEqual({
      activeIndex: 1,
      deployedTeamIndex: 1,
      result: PartyTeamResult.Done,
    });
  });

  test("refuses a team with nobody in it or nobody standing", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.teams[1] = { characterIds: [2], name: "" };
    party.fallenCharacterIds.push(2);

    expect([deployPartyTeam(party, 1), deployPartyTeam(party, 2), party.deployedTeamIndex]).toStrictEqual([
      PartyTeamResult.Down,
      PartyTeamResult.Empty,
      0,
    ]);
  });
});
