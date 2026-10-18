import { isSheerColdArea } from "#src/services/sheerCold/isSheerColdArea";
import { describe, expect, test } from "vitest";

describe(isSheerColdArea, () => {
  test("should hold Dragonspine's sheer cold", () => {
    expect.hasAssertions();

    expect(isSheerColdArea({ id: "dragonspine" })).toBe(true);
  });

  test("should hold no sheer cold in another area, or where no area holds the character", () => {
    expect.hasAssertions();

    expect(isSheerColdArea({ id: "galesong-hill" })).toBe(false);
    expect(isSheerColdArea(undefined)).toBe(false);
  });
});
