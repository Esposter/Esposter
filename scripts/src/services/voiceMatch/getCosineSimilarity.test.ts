import { getCosineSimilarity } from "#src/services/voiceMatch/getCosineSimilarity";
import { describe, expect, test } from "vitest";

describe(getCosineSimilarity, () => {
  test("is one for the same direction, zero across and negative against", () => {
    expect.hasAssertions();

    expect(getCosineSimilarity(Float32Array.of(1, 0), Float32Array.of(1, 0))).toBe(1);
    expect(getCosineSimilarity(Float32Array.of(1, 0), Float32Array.of(0, 1))).toBe(0);
    expect(getCosineSimilarity(Float32Array.of(1, 0), Float32Array.of(-1, 0))).toBe(-1);
  });
});
