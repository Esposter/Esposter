import { addPartyTeam } from "#src/services/party/addPartyTeam";
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

  test("an empty rename gives an added team its game name back", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    renamePartyTeam(party, 4, "Boss");
    renamePartyTeam(party, 4, "");

    expect(party.teams[4]?.name).toBe("");
  });
});
