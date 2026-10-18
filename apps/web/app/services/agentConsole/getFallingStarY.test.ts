import {
  FALLING_STAR_DURATION_SECONDS,
  FALLING_STAR_LAND_Y,
  FALLING_STAR_START_Y,
} from "@/services/agentConsole/constants";
import { getFallingStarY } from "@/services/agentConsole/getFallingStarY";
import { describe, expect, test } from "vitest";

describe(getFallingStarY, () => {
  test("starts above the view and lands in the nameplate, holding there after the fall", () => {
    expect.hasAssertions();

    expect(getFallingStarY(0)).toBe(FALLING_STAR_START_Y);
    expect(getFallingStarY(FALLING_STAR_DURATION_SECONDS)).toBe(FALLING_STAR_LAND_Y);
    expect(getFallingStarY(FALLING_STAR_DURATION_SECONDS * 2)).toBe(FALLING_STAR_LAND_Y);
  });
});
