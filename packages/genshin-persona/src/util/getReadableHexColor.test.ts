import { getContrastRatio } from "#src/util/getContrastRatio";
import { getReadableHexColor } from "#src/util/getReadableHexColor";
import { describe, expect, test } from "vitest";

describe(getReadableHexColor, () => {
  const black = "#000000";

  test("keeps a colour that already meets AA", () => {
    expect.hasAssertions();

    const hexColor = "#ffffff";

    expect(getReadableHexColor(hexColor, black)).toBe(hexColor);
  });

  test("lightens a colour that does not until it meets AA", () => {
    expect.hasAssertions();

    const readableHexColor = getReadableHexColor("#800000", black);

    expect(readableHexColor).toBe("#c64f41");
    expect(getContrastRatio(readableHexColor, black)).toBeGreaterThanOrEqual(4.5);
  });
});
