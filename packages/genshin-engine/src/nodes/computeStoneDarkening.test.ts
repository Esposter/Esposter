import { computeStoneDarkening } from "#src/nodes/computeStoneDarkening";
import { STONE_DARKENING_TOP } from "#src/nodes/constants";
import { describe, expect, test } from "vitest";

describe(computeStoneDarkening, () => {
  test("lights the stone at or under the ground whole and holds the light past the top", () => {
    expect.hasAssertions();

    expect(computeStoneDarkening(-1, 1)).toBe(1);
    expect(computeStoneDarkening(STONE_DARKENING_TOP + 1, 1)).toBe(computeStoneDarkening(STONE_DARKENING_TOP, 1));
  });
});
