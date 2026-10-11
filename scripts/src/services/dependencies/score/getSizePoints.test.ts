import { describe, expect, test } from "vitest";
import { getSizePoints } from "#src/services/dependencies/score/getSizePoints";

describe(getSizePoints, () => {
  test.each([
    [499, 35],
    [500, 26],
    [1999, 26],
    [2000, 15],
    [4999, 15],
    [5000, 6],
    [19999, 6],
    [20000, 0],
  ])("%s lines scores %s", (sourceLines, points) => {
    expect.hasAssertions();

    expect(getSizePoints(sourceLines)).toBe(points);
  });
});
