import { getCosineSimilarity } from "#src/services/voiceMatch/rank/getCosineSimilarity";
import { describe, expect, test } from "vitest";

describe(getCosineSimilarity, () => {
  test("is one for the same direction, zero across and negative against", () => {
    expect.hasAssertions();

    expect(getCosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(getCosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(getCosineSimilarity([1, 0], [-1, 0])).toBe(-1);
  });
});
