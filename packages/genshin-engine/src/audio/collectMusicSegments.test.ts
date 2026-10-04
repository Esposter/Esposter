import type { Music } from "#src/audio/Music";

import { collectMusicSegments } from "#src/audio/collectMusicSegments";
import { describe, expect, test } from "vitest";

describe(collectMusicSegments, () => {
  // A piece and a rest played twice a pass, as the login's playlist is: piece, rest, piece, rest
  const music: Music = {
    isLooping: true,
    order: [0, 1, 0, 1],
    segments: [
      { duration: 2, expression: [], voices: [] },
      { duration: 3, expression: [], voices: [] },
    ],
  };

  test("walks a segment each time the order names it", () => {
    expect.hasAssertions();

    expect(collectMusicSegments(music, 0, 10).map(({ start }) => start)).toStrictEqual([0, 2, 5, 7]);
  });

  test("runs on past a pass's end while the playlist loops", () => {
    expect.hasAssertions();

    expect(collectMusicSegments(music, 9, 12).map(({ start }) => start)).toStrictEqual([7, 10]);
  });

  test("ends after one pass when the playlist does not loop", () => {
    expect.hasAssertions();

    expect(collectMusicSegments({ ...music, isLooping: false }, 9, 12).map(({ start }) => start)).toStrictEqual([7]);
  });
});
