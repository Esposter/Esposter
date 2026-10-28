import { describe, expect, test } from "vitest";

import { SIN_HALF_LIFE_PROMPTS } from "./constants";
import { getPosteriorTrail } from "./getPosteriorTrail";
import { getTrend, getTrendGlyphs } from "./getTrend";

describe(getTrend, () => {
  test("keeps the last thirty scores, one per prompt", () => {
    expect.hasAssertions();

    const evidences = Array.from({ length: SIN_HALF_LIFE_PROMPTS + 10 }, () => 0.5);
    expect(getTrend(getPosteriorTrail(evidences))).toHaveLength(SIN_HALF_LIFE_PROMPTS);
  });
});

describe(getTrendGlyphs, () => {
  test("draws the lowest glyph for none and the tallest for the whole", () => {
    expect.hasAssertions();

    expect(getTrendGlyphs([0, 1])).toBe("▁█");
  });
});
