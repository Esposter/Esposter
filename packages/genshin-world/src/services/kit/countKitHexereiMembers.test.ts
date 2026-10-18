import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { MONA_CHARACTER_ID } from "#src/services/kit/characters/monaKit";
import { NICOLE_CHARACTER_ID } from "#src/services/kit/characters/nicoleKit";
import { countKitHexereiMembers } from "#src/services/kit/countKitHexereiMembers";
import { describe, expect, test } from "vitest";

describe(countKitHexereiMembers, () => {
  test.each([
    { ids: [], name: "an empty team", expected: 0 },
    { ids: [TRAVELER_CHARACTER_ID], name: "a team with no Hexerei character", expected: 0 },
    { ids: [NICOLE_CHARACTER_ID, MONA_CHARACTER_ID], name: "a team of two Hexerei characters", expected: 2 },
    { ids: [FISCHL_CHARACTER_ID, TRAVELER_CHARACTER_ID], name: "a team with one Hexerei character", expected: 1 },
  ])("counts the Hexerei characters of $name", ({ ids, expected }) => {
    expect.hasAssertions();
    expect(countKitHexereiMembers(ids)).toBe(expected);
  });
});
