import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { createParty } from "#src/services/party/createParty";
import { quickSetupPartyTeam } from "#src/services/party/quickSetupPartyTeam";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { describe, expect, test } from "vitest";

describe(quickSetupPartyTeam, () => {
  test("quick setup fills the four slots in order", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    setPartyTeamCharacters(party, 1, [6]);
    const result = quickSetupPartyTeam(party, 1, [5, 6, 7, 8, 9]);

    expect({ characterIds: party.teams[1]?.characterIds, result }).toStrictEqual({
      characterIds: [6, 5, 7, 8],
      result: PartyTeamResult.Done,
    });
  });
});
