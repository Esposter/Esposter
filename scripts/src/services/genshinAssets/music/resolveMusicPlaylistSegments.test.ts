import type { MusicPlaylistItem } from "#src/models/genshinAssets/music/MusicPlaylistItem";

import { MusicPlaylistType } from "#src/models/genshinAssets/music/MusicPlaylistType";
import { resolveMusicPlaylistSegments } from "#src/services/genshinAssets/music/resolveMusicPlaylistSegments";
import { describe, expect, test } from "vitest";

const createLeaf = (segmentId: number, loopCount = 1): MusicPlaylistItem => ({
  childCount: 0,
  loopCount,
  segmentId,
  type: MusicPlaylistType.Leaf,
});
const createGroup = (childCount: number, type: MusicPlaylistType, loopCount = 0): MusicPlaylistItem => ({
  childCount,
  loopCount,
  segmentId: 0,
  type,
});

describe(resolveMusicPlaylistSegments, () => {
  test("plays a looping sequence's leaves in turn, a leaf as many times as it loops", () => {
    expect.hasAssertions();

    const items = [
      createGroup(3, MusicPlaylistType.SequenceContinuous),
      createLeaf(1),
      createGroup(1, MusicPlaylistType.SequenceStep, 2),
      createLeaf(2),
      createLeaf(3, 2),
    ];

    expect(resolveMusicPlaylistSegments({ id: 0, items, segmentIds: [1, 2, 3] })).toStrictEqual([1, 2, 2, 3, 3]);
  });

  test("refuses a random group", () => {
    expect.hasAssertions();

    const items = [createGroup(1, MusicPlaylistType.RandomContinuous), createLeaf(1)];

    expect(() => resolveMusicPlaylistSegments({ id: 0, items, segmentIds: [1] })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 0, plays a group in a random order]`,
    );
  });
});
