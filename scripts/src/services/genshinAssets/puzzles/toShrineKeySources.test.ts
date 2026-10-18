import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";

import { toShrineKeySources } from "#src/services/genshinAssets/puzzles/toShrineKeySources";
import { describe, expect, test } from "vitest";

const englishTextMap = new Map([
  ["9001", "Mondstadt Shrine of Depths Key"],
  ["9002", "Ore Chunk"],
  ["9003", "Testland Shrine of Depths Key"],
]);
const materials = [
  { id: 9001, nameTextMapHash: 9001 },
  { id: 9002, nameTextMapHash: 9002 },
  { id: 9003, nameTextMapHash: 9003 },
];
const rewards = new Map([
  [
    9101,
    {
      rewardId: 9101,
      rewardItemList: [
        { itemCount: 1, itemId: 9001 },
        { itemCount: 500, itemId: 9002 },
      ],
    },
  ],
  [9102, { rewardId: 9102, rewardItemList: [{ itemCount: 1, itemId: 9003 }] }],
  [9103, { rewardId: 9103, rewardItemList: [{ itemCount: 500, itemId: 9002 }] }],
]);
const createQuest = (id: number, rewardIdList?: number[]): DumpedMainQuest => ({
  descTextMapHash: 0,
  id,
  rewardIdList,
  titleTextMapHash: 0,
});

describe(toShrineKeySources, () => {
  test("a quest reward naming a shrine key gives its source, filed under the key's region", () => {
    expect.hasAssertions();

    expect(
      toShrineKeySources({ englishTextMap, materials, quests: [createQuest(9201, [9101])], rewards }).objects,
    ).toStrictEqual({
      "shrineKeySources/mondstadt": [
        { id: "quest-9201-9001", keyItemId: 9001, keyRegion: "mondstadt", questId: 9201, rewardId: 9101 },
      ],
    });
  });

  test("a quest whose reward names no shrine key gives no source", () => {
    expect.hasAssertions();

    expect(
      toShrineKeySources({
        englishTextMap,
        materials,
        quests: [createQuest(9203, [9103]), createQuest(9204)],
        rewards,
      }),
    ).toStrictEqual({ notes: [], objects: {} });
  });

  test("a shrine key whose region the map does not know is left out and noted", () => {
    expect.hasAssertions();

    const { notes, objects } = toShrineKeySources({
      englishTextMap,
      materials,
      quests: [createQuest(9202, [9102])],
      rewards,
    });

    expect({ notes: notes.length, objects }).toStrictEqual({ notes: 1, objects: {} });
    expect(notes[0]).toContain("Testland");
  });
});
