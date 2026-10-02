import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { CHROMA_FRAME_LENGTH, CHROMA_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { describe, expect, test } from "vitest";

describe(computeChroma, () => {
  test("reads a tone's pitch class as its frame's largest weight, and a silent frame as no pitch", () => {
    expect.hasAssertions();

    const frequency = 440;
    const tone = Float32Array.from({ length: CHROMA_FRAME_LENGTH }, (_, index) =>
      Math.sin((2 * Math.PI * frequency * index) / CHROMA_SAMPLE_RATE),
    );
    const tonal = computeChroma(tone, CHROMA_SAMPLE_RATE);
    const silent = computeChroma(new Float32Array(CHROMA_FRAME_LENGTH), CHROMA_SAMPLE_RATE);
    const classes = [...tonal.classes];

    expect(classes.indexOf(Math.max(...classes))).toBe(9);
    expect([...silent.classes]).toStrictEqual(Array.from({ length: 12 }, () => 0));
  });
});
