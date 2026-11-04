import { getContrastingColor } from "@/services/ui/getContrastingColor";
import { describe, expect, test } from "vitest";

describe(getContrastingColor, () => {
  test.each([
    ["a light fill", "#ffffff", "#000000"],
    ["a dark fill", "#000000", "#ffffff"],
    ["a mid fill", "#808080", "#000000"],
  ])("%s takes the colour that contrasts more with it", (_name, fill, expected) => {
    expect.hasAssertions();

    expect(getContrastingColor(fill)).toBe(expected);
  });
});
