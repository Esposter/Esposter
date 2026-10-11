import { getSelfContainmentPoints } from "#src/services/dependencies/score/getSelfContainmentPoints";
import { describe, expect, test } from "vitest";

describe(getSelfContainmentPoints, () => {
  test.each([
    [0, 20],
    [1, 12],
    [2, 12],
    [3, 5],
    [5, 5],
    [6, 0],
  ])("%s dependencies scores %s", (dependencyCount, points) => {
    expect.hasAssertions();

    expect(getSelfContainmentPoints(dependencyCount)).toBe(points);
  });
});
