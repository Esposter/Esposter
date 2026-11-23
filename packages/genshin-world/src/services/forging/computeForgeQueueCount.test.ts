import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { computeForgeQueueCount } from "#src/services/forging/computeForgeQueueCount";
import { describe, expect, test } from "vitest";

const { forgeQueuePlayerLevels } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);

describe(computeForgeQueueCount, () => {
  test("should open one queue at first, and another at each rank the game opens one at", () => {
    expect.hasAssertions();

    expect(computeForgeQueueCount(1, forgeQueuePlayerLevels)).toBe(1);
    expect(computeForgeQueueCount(4, forgeQueuePlayerLevels)).toBe(1);
    expect(computeForgeQueueCount(5, forgeQueuePlayerLevels)).toBe(2);
    expect(computeForgeQueueCount(10, forgeQueuePlayerLevels)).toBe(3);
    expect(computeForgeQueueCount(15, forgeQueuePlayerLevels)).toBe(4);
    expect(computeForgeQueueCount(20, forgeQueuePlayerLevels)).toBe(4);
  });
});
