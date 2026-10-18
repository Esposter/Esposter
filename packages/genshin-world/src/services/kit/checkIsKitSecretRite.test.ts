import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { MONA_CHARACTER_ID } from "#src/services/kit/characters/monaKit";
import { checkIsKitSecretRite } from "#src/services/kit/checkIsKitSecretRite";
import { describe, expect, test } from "vitest";

describe(checkIsKitSecretRite, () => {
  test.each([
    { expected: false, ids: [FISCHL_CHARACTER_ID, TRAVELER_CHARACTER_ID], name: "one Hexerei member" },
    {
      expected: true,
      ids: [FISCHL_CHARACTER_ID, MONA_CHARACTER_ID, TRAVELER_CHARACTER_ID],
      name: "two Hexerei members",
    },
  ])("a team with $name holds Hexerei: Secret Rite: $expected", ({ expected, ids }) => {
    expect.hasAssertions();
    expect(checkIsKitSecretRite(ids)).toBe(expected);
  });
});
