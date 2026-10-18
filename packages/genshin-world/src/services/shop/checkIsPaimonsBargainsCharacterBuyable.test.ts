import { checkIsPaimonsBargainsCharacterBuyable } from "#src/services/shop/checkIsPaimonsBargainsCharacterBuyable";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { describe, expect, test } from "vitest";

describe(checkIsPaimonsBargainsCharacterBuyable, () => {
  test("a character with full constellations cannot be bought", () => {
    expect.hasAssertions();
    expect(checkIsPaimonsBargainsCharacterBuyable({ constellationCount: CONSTELLATION_COUNT })).toBe(false);
  });

  test("a character below full constellations, or not held, can be bought", () => {
    expect.hasAssertions();
    expect(checkIsPaimonsBargainsCharacterBuyable({ constellationCount: CONSTELLATION_COUNT - 1 })).toBe(true);
    expect(checkIsPaimonsBargainsCharacterBuyable(undefined)).toBe(true);
  });
});
