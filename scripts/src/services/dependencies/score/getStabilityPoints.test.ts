import { describe, expect, test } from "vitest";
import { getStabilityPoints } from "#src/services/dependencies/score/getStabilityPoints";

describe(getStabilityPoints, () => {
  test.each([
    [0, 25],
    [2, 25],
    [3, 15],
    [6, 15],
    [7, 7],
    [15, 7],
    [16, 0],
  ])("%s releases scores %s", (releaseCount, points) => {
    expect.hasAssertions();

    expect(getStabilityPoints(releaseCount)).toBe(points);
  });
});
