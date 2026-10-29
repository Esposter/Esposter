import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterPackIndex } from "#src/services/character/readCharacterPackIndex";
import { describe, expect, test } from "vitest";

describe(readCharacterPackIndex, () => {
  test("reads the index the publish wrote, listing the Traveler's pack", async () => {
    expect.hasAssertions();

    const { avatars } = await readCharacterPackIndex(GAME_DATA_LOCAL_BASE_URL);

    expect(avatars.map(({ avatarId }) => avatarId)).toContain(TRAVELER_CHARACTER_ID);
  });
});
