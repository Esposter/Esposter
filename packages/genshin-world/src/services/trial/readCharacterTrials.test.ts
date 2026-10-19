import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readGameData } from "#src/services/data/readGameData";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(readCharacterTrials, () => {
  // Each table comes back under its own field, so a swapped key would hand one table's records to another
  test("reads each character trial table under its own published key", async () => {
    expect.hasAssertions();

    await expect(readCharacterTrials(GAME_DATA_LOCAL_BASE_URL)).resolves.toStrictEqual({
      avatars: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/avatars", z.unknown()),
      builds: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/builds", z.unknown()),
      reliquaries: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/reliquaries", z.unknown()),
      rewards: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/rewards", z.unknown()),
      stages: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/stages", z.unknown()),
      templates: await readGameData(GAME_DATA_LOCAL_BASE_URL, "characterTrials/templates", z.unknown()),
    });
  });
});
