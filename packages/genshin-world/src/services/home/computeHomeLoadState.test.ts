import { HomeLoadState } from "#src/models/home/HomeLoadState";
import { computeHomeLoadState } from "#src/services/home/computeHomeLoadState";
import { describe, expect, test } from "vitest";

describe(computeHomeLoadState, () => {
  const ORANGE_LOAD = 4;
  const RED_LOAD = 6;
  const area = { orangeLoad: ORANGE_LOAD, redLoad: RED_LOAD };

  test("a load under the orange load reads green", () => {
    expect.hasAssertions();

    expect(computeHomeLoadState(ORANGE_LOAD - 1, area)).toBe(HomeLoadState.Green);
  });

  test("a load from the orange load up to the red load reads orange", () => {
    expect.hasAssertions();

    expect(computeHomeLoadState(ORANGE_LOAD, area)).toBe(HomeLoadState.Orange);
    expect(computeHomeLoadState(RED_LOAD - 1, area)).toBe(HomeLoadState.Orange);
  });

  test("a load from the red load up reads red", () => {
    expect.hasAssertions();

    expect(computeHomeLoadState(RED_LOAD, area)).toBe(HomeLoadState.Red);
  });
});
