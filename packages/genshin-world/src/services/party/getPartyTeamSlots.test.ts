import { Element } from "#src/models/Element";
import { addPartyTeam } from "#src/services/party/addPartyTeam";
import { createParty } from "#src/services/party/createParty";
import { deployPartyTeam } from "#src/services/party/deployPartyTeam";
import { getPartyTeamSlots } from "#src/services/party/getPartyTeamSlots";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { assert, describe, expect, test } from "vitest";

describe(getPartyTeamSlots, () => {
  test("party setup opens showing the deployed team", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    addPartyTeam(party);
    setPartyTeamCharacters(party, 1, [2, 3]);
    deployPartyTeam(party, 1);
    const deployedTeam = party.teams[party.deployedTeamIndex];
    assert(deployedTeam);

    const slots = getPartyTeamSlots(
      deployedTeam,
      [
        { id: 1, level: 20 },
        { id: 2, level: 5 },
        { id: 3, level: 7 },
      ],
      new Map([
        [1, { element: Element.Pyro, nameTextId: "1" }],
        [2, { element: Element.Hydro, nameTextId: "2" }],
        [3, { element: Element.Electro, nameTextId: "3" }],
      ]),
      { "1": "First", "2": "Second", "3": "Third" },
      "",
    );

    expect(slots).toStrictEqual([
      { element: Element.Hydro, level: 5, name: "Second" },
      { element: Element.Electro, level: 7, name: "Third" },
      { level: 0, name: "" },
      { level: 0, name: "" },
    ]);
  });
});
