import { checkIsAudible } from "#src/services/checkIsAudible";
import { VOICE_SAMPLE_RATE } from "#src/services/constants";
import { getFrameEnergiesDb } from "#src/services/getFrameEnergiesDb";
import { describe, expect, test } from "vitest";

describe(checkIsAudible, () => {
  // A tenth of a second, half of it for the burst
  const length = VOICE_SAMPLE_RATE / 10;
  const getClip = (getSample: (index: number) => number) =>
    getFrameEnergiesDb({
      sampleRate: VOICE_SAMPLE_RATE,
      samples: Float32Array.from({ length }, (_value, index) => getSample(index)),
    });

  test.each([
    { clip: getClip((index) => (index < length / 2 ? 1 : 0)), expected: true, name: "a burst with a pause after it" },
    // A chunk of speech runs on with no pause deep enough for a sentence's check, and is still audible
    { clip: getClip(() => 1), expected: true, name: "a full-scale constant with no pause" },
    { clip: getClip(() => 0.001), expected: false, name: "a constant near-silence" },
  ])("$name", ({ clip, expected }) => {
    expect.hasAssertions();

    expect(checkIsAudible(clip)).toBe(expected);
  });
});
