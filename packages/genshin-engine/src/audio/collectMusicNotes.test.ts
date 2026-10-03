import type { Music } from "#src/audio/Music";

import { collectMusicNotes } from "#src/audio/collectMusicNotes";
import { describe, expect, test } from "vitest";

describe(collectMusicNotes, () => {
  const instrument = { attack: 0, decay: 1, harmonics: [1], level: 1, noise: 0, release: 1, sustain: 1, tuning: 0 };
  const note = { duration: 1, pitch: 69, start: 1, velocity: 1 };
  // A piece and a rest played twice a pass, as the login's playlist is: piece, rest, piece, rest
  const music: Music = {
    isLooping: true,
    order: [0, 1, 0, 1],
    segments: [
      { duration: 2, voices: [{ instrument, notes: [note] }] },
      { duration: 3, voices: [] },
    ],
  };

  test("plays a segment each time the order names it", () => {
    expect.hasAssertions();

    expect(collectMusicNotes(music, 0, 10).map(({ time }) => time)).toStrictEqual([1, 6]);
  });

  test("runs on past a pass's end while the playlist loops", () => {
    expect.hasAssertions();

    expect(collectMusicNotes(music, 9, 12).map(({ time }) => time)).toStrictEqual([11]);
  });

  test("ends after one pass when the playlist does not loop", () => {
    expect.hasAssertions();

    expect(collectMusicNotes({ ...music, isLooping: false }, 9, 12)).toStrictEqual([]);
  });
});
