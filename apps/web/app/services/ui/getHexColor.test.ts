import { getHexColor } from "@/services/ui/getHexColor";
import { describe, expect, test } from "vitest";

describe(getHexColor, () => {
  test("sRGB channels are read as a six-digit hex colour, each rounded to its 8-bit value", () => {
    expect.hasAssertions();

    expect(getHexColor([1, 0, 0.5])).toBe("#ff0080");
  });
});
