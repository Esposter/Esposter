import { getContrastRatio } from "#src/util/getContrastRatio";
import { describe, expect, test } from "vitest";

describe(getContrastRatio, () => {
  const black = "#000000";
  const white = "#ffffff";

  test.each([
    [black, black, 1],
    [black, white, 21],
    [white, black, 21],
  ])("rates %s against %s at %d", (hexColor, otherHexColor, contrastRatio) => {
    expect.hasAssertions();

    expect(getContrastRatio(hexColor, otherHexColor)).toBe(contrastRatio);
  });
});
