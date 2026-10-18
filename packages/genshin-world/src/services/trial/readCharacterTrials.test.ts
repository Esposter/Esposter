import type { readGameData } from "#src/services/data/readGameData";

import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { describe, expect, test, vi } from "vitest";

const { TABLES } = vi.hoisted(() => ({
  TABLES: {
    "characterTrials/avatars": { 1022: { characterId: 10_000_022, level: 90, trialAvatarId: 1022 } },
    "characterTrials/builds": {
      10_000_022: { characterId: 10_000_022, constellation: 0, refinement: 1, weaponId: 11_301 },
    },
    "characterTrials/reliquaries": {
      91: { appendPropIds: [201_053], id: 91, level: 5, mainPropId: 15_004, reliquaryId: 60_211 },
    },
    "characterTrials/rewards": { 480_001: [{ count: 5, itemId: 201 }] },
    "characterTrials/stages": {
      51_001: { dungeonId: 6131, id: 51_001, rewardId: 480_001, trialAvatarId: 1022, trialAvatarIndexId: 1 },
    },
    "characterTrials/templates": [{ level: 85, reliquaryIds: [91], talentLevel: 8 }],
  },
}));

vi.mock(import("#src/services/data/readGameData"), () => ({
  readGameData: ((_gameDataBaseUrl: string, key: string) =>
    Promise.resolve(TABLES[key as keyof typeof TABLES])) as typeof readGameData,
}));

describe(readCharacterTrials, () => {
  // Each table comes back under its own field, so a swapped key would hand one table's records to another
  test("reads each character trial table under its own published key", async () => {
    expect.hasAssertions();

    await expect(readCharacterTrials("https://example.invalid/")).resolves.toStrictEqual({
      avatars: TABLES["characterTrials/avatars"],
      builds: TABLES["characterTrials/builds"],
      reliquaries: TABLES["characterTrials/reliquaries"],
      rewards: TABLES["characterTrials/rewards"],
      stages: TABLES["characterTrials/stages"],
      templates: TABLES["characterTrials/templates"],
    });
  });
});
