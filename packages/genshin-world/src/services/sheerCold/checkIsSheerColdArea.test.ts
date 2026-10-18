import { checkIsSheerColdArea } from "#src/services/sheerCold/checkIsSheerColdArea";
import { describe, expect, test } from "vitest";

describe(checkIsSheerColdArea, () => {
  test("should hold Dragonspine's sheer cold", () => {
    expect.hasAssertions();

    expect(checkIsSheerColdArea({ id: "dragonspine" })).toBe(true);
  });

  test("should hold no sheer cold in another area, or where no area holds the character", () => {
    expect.hasAssertions();

    expect(checkIsSheerColdArea({ id: "galesong-hill" })).toBe(false);
    expect(checkIsSheerColdArea(undefined)).toBe(false);
  });
});
