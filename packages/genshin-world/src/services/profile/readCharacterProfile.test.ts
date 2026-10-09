import { readCharacterProfile } from "#src/services/profile/readCharacterProfile";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(readCharacterProfile, () => {
  const AMBER_CHARACTER_ID = 10000021;
  const AMBER_NAMECARD_NAME_TEXT_ID = 273889772;
  const AMBER_LEVEL_10_EXP = 29100;

  test("should give the namecard's name text id only from Friendship Level 10, and 0 one EXP below it", async () => {
    expect.hasAssertions();

    const atLevel10 = await readCharacterProfile(AMBER_CHARACTER_ID, GameLanguage.English, AMBER_LEVEL_10_EXP);
    const belowLevel10 = await readCharacterProfile(AMBER_CHARACTER_ID, GameLanguage.English, AMBER_LEVEL_10_EXP - 1);

    expect([atLevel10.namecardNameTextId, belowLevel10.namecardNameTextId]).toStrictEqual([
      AMBER_NAMECARD_NAME_TEXT_ID,
      0,
    ]);
  });
});
