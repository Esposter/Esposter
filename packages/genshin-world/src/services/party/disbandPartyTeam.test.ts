import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { addPartyTeam } from "#src/services/party/addPartyTeam";
import { createParty } from "#src/services/party/createParty";
import { deployPartyTeam } from "#src/services/party/deployPartyTeam";
import { disbandPartyTeam } from "#src/services/party/disbandPartyTeam";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { describe, expect, test } from "vitest";

describe(disbandPartyTeam, () => {
  test("the deployed team cannot be disbanded", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    setPartyTeamCharacters(party, 4, [2]);
    deployPartyTeam(party, 4);

    expect([disbandPartyTeam(party, 4), party.teams.length]).toStrictEqual([PartyTeamResult.Kept, 5]);
  });

  test("the four default teams are kept", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);

    expect([disbandPartyTeam(party, 0), disbandPartyTeam(party, 3), party.teams.length]).toStrictEqual([
      PartyTeamResult.Kept,
      PartyTeamResult.Kept,
      5,
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
