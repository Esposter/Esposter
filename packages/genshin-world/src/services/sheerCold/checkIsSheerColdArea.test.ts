import { checkIsSheerColdArea } from "#src/services/sheerCold/checkIsSheerColdArea";
import { describe, expect, test } from "vitest";

describe(checkIsSheerColdArea, () => {
  test("a missing area holds no sheer cold", () => {
    expect.hasAssertions();

    expect(checkIsSheerColdArea(undefined)).toBe(false);
  });
});
