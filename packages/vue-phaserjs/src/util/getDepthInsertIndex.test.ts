import type { GameObjects } from "phaser";

import { getDepthInsertIndex } from "#src/util/getDepthInsertIndex";
import { describe, expect, test } from "vitest";

const createList = (depths: (number | undefined)[]): GameObjects.GameObject[] =>
  depths.map((depth) => ({ depth }) as unknown as GameObjects.GameObject);

describe(getDepthInsertIndex, () => {
  test("returns the first child rendered above the depth", () => {
    expect.hasAssertions();

    expect(getDepthInsertIndex(createList([1, 3, 5]), 2)).toBe(1);
    expect(getDepthInsertIndex(createList([2, 4, 6]), 1)).toBe(0);
  });

  test("returns -1 when the game object belongs at the end", () => {
    expect.hasAssertions();

    expect(getDepthInsertIndex(createList([1, 2, 3]), 5)).toBe(-1);
    expect(getDepthInsertIndex(createList([]), 1)).toBe(-1);
    // A child without a numeric depth never sorts above anything
    expect(getDepthInsertIndex(createList([undefined]), 1)).toBe(-1);
  });

  test("returns -1 for a non-numeric depth", () => {
    expect.hasAssertions();

    expect(getDepthInsertIndex(createList([1, 2]), undefined)).toBe(-1);
  });
});
