import { describe, expect, test } from "vitest";

import { getTrendGlyphs } from "./getTrendGlyphs";

describe(getTrendGlyphs, () => {
  test("draws the lowest glyph for none and the tallest for the whole", () => {
    expect.hasAssertions();

    expect(getTrendGlyphs([0, 1])).toBe("▁█");
  });
});
