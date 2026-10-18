import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMiningOutcropPlaces } from "#src/services/gathering/readMiningOutcropPlaces";
import { describe, expect, test } from "vitest";

describe(readMiningOutcropPlaces, () => {
  test("a region no publish wrote reads no mining outcrop", async () => {
    expect.hasAssertions();
    await expect(readMiningOutcropPlaces(GAME_DATA_LOCAL_BASE_URL, "unplaced-region")).resolves.toStrictEqual([]);
  });
});
