import { clampCell } from "#src/placement/clampCell";
import { describe, expect, test } from "vitest";

describe(clampCell, () => {
  test("a cell wider than the grid is narrowed to its columns", () => {
    expect.hasAssertions();

    expect(clampCell({ h: 1, id: "a", w: 8, x: 0, y: 0 }, 6)).toStrictEqual({ h: 1, id: "a", w: 6, x: 0, y: 0 });
  });

  test("a cell hanging over the last column moves its left edge in", () => {
    expect.hasAssertions();

    expect(clampCell({ h: 1, id: "a", w: 2, x: 8, y: 0 }, 6)).toStrictEqual({ h: 1, id: "a", w: 2, x: 4, y: 0 });
  });

  test("a cell above the top row moves down to it", () => {
    expect.hasAssertions();

    expect(clampCell({ h: 1, id: "a", w: 2, x: 0, y: -3 }, 6)).toStrictEqual({ h: 1, id: "a", w: 2, x: 0, y: 0 });
  });

  test("keeps an item at least one cell wide and tall", () => {
    expect.hasAssertions();

    expect(clampCell({ h: 0, id: "a", w: 0, x: 0, y: 0 }, 6)).toStrictEqual({ h: 1, id: "a", w: 1, x: 0, y: 0 });
  });
});
