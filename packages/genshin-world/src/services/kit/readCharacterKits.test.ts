import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { XIANGLING_CHARACTER_ID } from "#src/services/kit/characters/xianglingKit";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/generated/characterKitMap/CharacterIdCreateKitMap"), () => ({ CharacterIdCreateKitMap: {} }));

describe(readCharacterKits, () => {
  // Its own multipliers hold none of the Traveler's groups, so a kit built from them would fail to read its first one
  test("builds the Traveler's kit from the Traveler's multipliers for a character the map holds no module for", async () => {
    expect.hasAssertions();

    const characterIdKitMap = await readCharacterKits(GAME_DATA_LOCAL_BASE_URL, [
      XIANGLING_CHARACTER_ID,
      TRAVELER_CHARACTER_ID,
    ]);

    expect(characterIdKitMap.get(XIANGLING_CHARACTER_ID)).toStrictEqual(characterIdKitMap.get(TRAVELER_CHARACTER_ID));
  });
});
