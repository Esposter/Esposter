import { snapToGrid } from "#src/services/snapToGrid";
import { describe, expect, test } from "vitest";

describe(snapToGrid, () => {
  test.each([
    [37, 40],
    [41, 40],
    [60, 60],
    [-37, -40],
    [-41, -40],
  ])("%i snaps to %i on a grid of 20", (value, expected) => {
    expect.hasAssertions();

    expect(snapToGrid(value, 20)).toBe(expected);
  });
});
