import { describe, expect, test } from "vitest";

import { SIN_TREND_LENGTH } from "./constants";
import { getTrend, getTrendGlyphs } from "./getTrend";

describe(getTrend, () => {
  test("keeps the last thirty scores, one per prompt", () => {
    expect.hasAssertions();

    const evidences = Array.from({ length: SIN_TREND_LENGTH + 10 }, () => 0.5);
    expect(getTrend(evidences)).toHaveLength(SIN_TREND_LENGTH);
  });
});

describe(getTrendGlyphs, () => {
  test("draws the lowest glyph for none and the tallest for the whole", () => {
    expect.hasAssertions();

    expect(getTrendGlyphs([0, 1])).toBe("▁█");
  });
});
