import { getContrastingColor } from "@/services/ui/getContrastingColor";
import { describe, expect, test } from "vitest";

describe(getContrastingColor, () => {
  // The #777777 row is the one a midpoint rule gets wrong: WCAG contrast is 4.69:1 against black and 4.48:1 against white
  test.each([
    ["a white fill takes black, the colour with the higher WCAG contrast", "#ffffff", "#000000"],
    ["a black fill takes white, the colour with the higher WCAG contrast", "#000000", "#ffffff"],
    ["a mid grey takes black, which its WCAG contrast favours", "#808080", "#000000"],
    ["a grey under the midpoint takes black by WCAG contrast, where a midpoint rule takes white", "#777777", "#000000"],
  ])("%s", (_name, fill, expected) => {
    expect.hasAssertions();

    expect(getContrastingColor(fill)).toBe(expected);
  });
});
