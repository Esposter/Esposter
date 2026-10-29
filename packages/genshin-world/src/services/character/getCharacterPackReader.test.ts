import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterPackReader } from "#src/services/character/getCharacterPackReader";
import { describe, expect, test } from "vitest";

describe(getCharacterPackReader, () => {
  const characterId = 1;
  const characterPackReader: CharacterPackReader = { characterId, key: "", readFile: () => Promise.resolve(undefined) };
  const travelerPackReader: CharacterPackReader = {
    characterId: TRAVELER_CHARACTER_ID,
    key: "",
    readFile: () => Promise.resolve(undefined),
  };
  const characterPackReaders = new Map([
    [characterId, characterPackReader],
    [TRAVELER_CHARACTER_ID, travelerPackReader],
  ]);

  test("Listed character draws its own pack", () => {
    expect.hasAssertions();

    expect(getCharacterPackReader(characterPackReaders, characterId)).toBe(characterPackReader);
  });

  test("Character outside the index loads the Traveler", () => {
    expect.hasAssertions();

    expect(getCharacterPackReader(characterPackReaders, 2)).toBe(travelerPackReader);
  });
});
