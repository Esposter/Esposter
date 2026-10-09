import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { addPartyTeam } from "#src/services/party/addPartyTeam";
import { createParty } from "#src/services/party/createParty";
import { deployPartyTeam } from "#src/services/party/deployPartyTeam";
import { disbandPartyTeam } from "#src/services/party/disbandPartyTeam";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { describe, expect, test } from "vitest";

describe(disbandPartyTeam, () => {
  test("keeps the four default teams and the deployed one", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    addPartyTeam(party);
    setPartyTeamCharacters(party, 5, [2]);
    deployPartyTeam(party, 5);

    expect([disbandPartyTeam(party, 2), disbandPartyTeam(party, 5), party.teams.length]).toStrictEqual([
      PartyTeamResult.Kept,
      PartyTeamResult.Kept,
      6,
    ]);
  });

  test("disbands an added team, moving the deployed index down when the team was before it", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    addPartyTeam(party);
    setPartyTeamCharacters(party, 5, [2]);
    deployPartyTeam(party, 5);
    const result = disbandPartyTeam(party, 4);

    expect({ deployedTeamIndex: party.deployedTeamIndex, length: party.teams.length, result }).toStrictEqual({
      deployedTeamIndex: 4,
      length: 5,
      result: PartyTeamResult.Done,
    });
  });
});
