import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { addPartyTeam } from "#src/services/party/addPartyTeam";
import { PARTY_ADDED_TEAM_NAME, PARTY_TEAM_MAX_COUNT } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

describe(addPartyTeam, () => {
  test("adds an empty team named standing by, and refuses one past fifteen teams", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    while (party.teams.length < PARTY_TEAM_MAX_COUNT) addPartyTeam(party);
    const full = addPartyTeam(party);

    expect({ added: party.teams.at(-1), full, length: party.teams.length }).toStrictEqual({
      added: { characterIds: [], name: PARTY_ADDED_TEAM_NAME },
      full: PartyTeamResult.Full,
      length: PARTY_TEAM_MAX_COUNT,
    });
  });
});
