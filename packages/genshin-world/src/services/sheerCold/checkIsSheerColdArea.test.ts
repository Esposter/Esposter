import { checkIsSheerColdArea } from "#src/services/sheerCold/checkIsSheerColdArea";
import { describe, expect, test } from "vitest";

describe(checkIsSheerColdArea, () => {
  test("hold Dragonspine's sheer cold", () => {
    expect.hasAssertions();

    expect(checkIsSheerColdArea({ id: "dragonspine" })).toBe(true);
  });

  test("hold no sheer cold elsewhere", () => {
    expect.hasAssertions();

    expect(checkIsSheerColdArea({ id: "galesong-hill" })).toBe(false);
    expect(checkIsSheerColdArea(undefined)).toBe(false);
  });
});
