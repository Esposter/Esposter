import type { ProfileText } from "#src/models/profile/ProfileText";

import { GameDataset } from "#src/models/data/GameDataset";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readCharacterProfile } from "#src/services/profile/readCharacterProfile";
import { GameLanguage } from "genshin-text";
import { afterEach, describe, expect, test, vi } from "vitest";

// The profile is fetched through its index, so the fetch answers the index and the record by the hashes the lock names. The
// Record is a stub, since this test reads the Namecard's rule, not the profile's words
describe(readCharacterProfile, () => {
  const GAME_DATA_TEST_BASE_URL = "game-data";
  const AMBER_CHARACTER_ID = 10000021;
  const AMBER_NAMECARD_NAME_TEXT_ID = 273889772;
  const AMBER_LEVEL_10_EXP = 29100;
  const PROFILE_RECORD_HASH = "a".repeat(64);
  const profileText: ProfileText = { namecardIconName: "", stories: [], voices: [] };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should give the namecard's name text id only from Friendship Level 10, and 0 one EXP below it", async () => {
    expect.hasAssertions();

    const indexUrl = `${GAME_DATA_TEST_BASE_URL}/${gameDataLock.indexes[`${GameDataset.Profile}/${GameLanguage.English}`]}.json`;
    vi.spyOn(globalThis, "fetch").mockImplementation((url) =>
      Promise.resolve(Response.json(url === indexUrl ? { [AMBER_CHARACTER_ID]: PROFILE_RECORD_HASH } : profileText)),
    );

    const atLevel10 = await readCharacterProfile(
      GAME_DATA_TEST_BASE_URL,
      AMBER_CHARACTER_ID,
      GameLanguage.English,
      AMBER_LEVEL_10_EXP,
    );
    const belowLevel10 = await readCharacterProfile(
      GAME_DATA_TEST_BASE_URL,
      AMBER_CHARACTER_ID,
      GameLanguage.English,
      AMBER_LEVEL_10_EXP - 1,
    );

    expect([atLevel10.namecardNameTextId, belowLevel10.namecardNameTextId]).toStrictEqual([
      AMBER_NAMECARD_NAME_TEXT_ID,
      0,
    ]);
  });
});
