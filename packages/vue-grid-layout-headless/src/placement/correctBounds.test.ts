import { correctBounds } from "#src/placement/correctBounds";
import { describe, expect, test } from "vitest";

describe(correctBounds, () => {
  test("an item wider than the grid", () => {
    expect.hasAssertions();

    expect(correctBounds([{ h: 1, id: "a", w: 8, x: 0, y: 0 }], 6)).toStrictEqual([
      { h: 1, id: "a", w: 6, x: 0, y: 0 },
    ]);
  });

  test("keeps an item inside the columns by moving its left edge in", () => {
    expect.hasAssertions();

    expect(correctBounds([{ h: 1, id: "a", w: 2, x: 8, y: 0 }], 6)).toStrictEqual([
      { h: 1, id: "a", w: 2, x: 4, y: 0 },
    ]);
  });

  test("keeps an item at least one cell wide and tall", () => {
    expect.hasAssertions();

    expect(correctBounds([{ h: 0, id: "a", w: 0, x: 0, y: 0 }], 6)).toStrictEqual([
      { h: 1, id: "a", w: 1, x: 0, y: 0 },
    ]);
  });
});
