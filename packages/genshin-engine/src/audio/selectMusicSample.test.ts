import type { MusicSampleRange } from "#src/audio/MusicSampleRange";

import { selectMusicSample } from "#src/audio/selectMusicSample";
import { describe, expect, test } from "vitest";

describe(selectMusicSample, () => {
  const soft: MusicSampleRange = { highKey: 61, highVelocity: 63, lowKey: 60, lowVelocity: 1 };
  const loud: MusicSampleRange = { highKey: 61, highVelocity: 127, lowKey: 60, lowVelocity: 64 };
  const high: MusicSampleRange = { highKey: 63, highVelocity: 127, lowKey: 62, lowVelocity: 1 };
  const samples = [soft, loud, high];

  test.each<[number, number, MusicSampleRange]>([
    [60, 0, soft],
    [61, 1, loud],
    [62, 0, high],
    [59, 1, loud],
    [64, 0, high],
  ])("plays pitch %s at velocity %s from its nearest recording", (pitch, velocity, expected) => {
    expect.hasAssertions();

    expect(selectMusicSample(samples, pitch, velocity)).toBe(expected);
  });
});
