import { getMixedHexColor } from "#src/util/getMixedHexColor";
import { describe, expect, test } from "vitest";

describe(getMixedHexColor, () => {
  const black = "#000000";
  const white = "#ffffff";

  test.each([
    [0, black],
    [50, "#808080"],
    [100, white],
  ])("mixes %d% of white into black as %s", (percentage, hexColor) => {
    expect.hasAssertions();

    expect(getMixedHexColor(white, percentage, black)).toBe(hexColor);
  });
});
