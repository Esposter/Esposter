import { addPartyTeam } from "#src/services/party/addPartyTeam";
import { PARTY_ADDED_TEAM_NAME } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { renamePartyTeam } from "#src/services/party/renamePartyTeam";
import { describe, expect, test } from "vitest";

describe(renamePartyTeam, () => {
  test("a team is added and renamed", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    renamePartyTeam(party, 4, "Boss");

    expect(party.teams[4]?.name).toBe("Boss");
  });

  test("gives an added team back its standing-by name on an empty rename", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    renamePartyTeam(party, 4, "Boss");
    const renamed = party.teams[4]?.name;
    renamePartyTeam(party, 4, "");

    expect({ name: party.teams[4]?.name, renamed }).toStrictEqual({ name: PARTY_ADDED_TEAM_NAME, renamed: "Boss" });
  });
});
