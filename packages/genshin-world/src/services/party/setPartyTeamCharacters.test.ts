import { PartyTeamResult } from "#src/models/party/PartyTeamResult";
import { createParty } from "#src/services/party/createParty";
import { setPartyTeamCharacters } from "#src/services/party/setPartyTeamCharacters";
import { describe, expect, test } from "vitest";

describe(setPartyTeamCharacters, () => {
  test("keeps the field on its slot, or the last past a shortened team", () => {
    expect.hasAssertions();

    const party = createParty([1, 2, 3]);
    party.activeIndex = 2;
    const result = setPartyTeamCharacters(party, 0, [4, 5]);

    expect({ activeIndex: party.activeIndex, characterIds: party.teams[0]?.characterIds, result }).toStrictEqual({
      activeIndex: 1,
      characterIds: [4, 5],
      result: PartyTeamResult.Done,
    });
  });

  test("refuses to empty the deployed team or to put a character who is down on the field", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    party.fallenCharacterIds.push(2);

    expect([
      setPartyTeamCharacters(party, 0, []),
      setPartyTeamCharacters(party, 0, [2, 1]),
      setPartyTeamCharacters(party, 1, [2]),
    ]).toStrictEqual([PartyTeamResult.Empty, PartyTeamResult.Down, PartyTeamResult.Done]);
  });

  test("refuses a character twice in one team", () => {
    expect.hasAssertions();

    expect(() => setPartyTeamCharacters(createParty([1]), 1, [2, 2])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: setPartyTeamCharacters, team 1 cannot hold 2, 2]`,
    );
  });
});
