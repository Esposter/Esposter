import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getSelectableCharacterIds } from "#src/services/party/getSelectableCharacterIds";
import { describe, expect, test } from "vitest";

describe(getSelectableCharacterIds, () => {
  const packedCharacterId = TRAVELER_CHARACTER_ID;
  const unpackedCharacterId = TRAVELER_CHARACTER_ID + 1;
  const characterPackReaders: ReadonlyMap<number, CharacterPackReader> = new Map([
    [packedCharacterId, { characterId: packedCharacterId, key: "", readFile: () => Promise.resolve(undefined) }],
  ]);

  test("character without a published pack is not selectable", () => {
    expect.hasAssertions();

    expect(
      getSelectableCharacterIds([{ id: unpackedCharacterId }, { id: packedCharacterId }], characterPackReaders),
    ).toStrictEqual([packedCharacterId]);
  });
});
