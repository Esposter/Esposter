import { checkIsSpeech } from "#src/services/checkIsSpeech";
import { VOICE_SAMPLE_RATE } from "#src/services/constants";
import { describe, expect, test } from "vitest";

describe(checkIsSpeech, () => {
  // A tenth of a second, half of it for the burst
  const length = VOICE_SAMPLE_RATE / 10;
  const getClip = (getSample: (index: number) => number) => ({
    sampleRate: VOICE_SAMPLE_RATE,
    samples: Float32Array.from({ length }, (_, index) => getSample(index)),
  });

  test.each([
    { clip: getClip((index) => (index < length / 2 ? 1 : 0)), expected: true, name: "a burst with a pause after it" },
    { clip: getClip(() => 0.001), expected: false, name: "a constant near-silence" },
    { clip: getClip(() => 1), expected: false, name: "a full-scale constant with no pause" },
  ])("$name", ({ clip, expected }) => {
    expect.hasAssertions();
    expect(checkIsSpeech(clip)).toBe(expected);
  });
});
