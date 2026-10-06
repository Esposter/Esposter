import { findCellRectangles } from "#src/services/genshinAssets/fit/findCellRectangles";
import { describe, expect, test } from "vitest";

// Each rectangle as the columns and the rows it spans
const toSpans = (rectangles: ReturnType<typeof findCellRectangles>): [number[], number[]][] =>
  rectangles.map(({ columns, rows }) => [columns, rows]);

describe(findCellRectangles, () => {
  // A grid four wide
  const width = 4;

  test("joins a run to the rectangle under it while it spans the same columns", () => {
    expect.hasAssertions();

    // Columns 1 and 2 of rows 0 to 2, then column 1 alone in row 3
    const rectangles = findCellRectangles([1, 2, 5, 6, 9, 10, 13], { getValue: () => 0, tolerance: 0, width });

    expect(toSpans(rectangles)).toStrictEqual([
      [
        [1, 3],
        [0, 3],
      ],
      [
        [1, 2],
        [3, 4],
      ],
    ]);
  });

  test("starts a new rectangle where a run's value leaves the tolerance", () => {
    expect.hasAssertions();

    const rectangles = findCellRectangles([0, 4], { getValue: (cell) => cell, tolerance: 1, width });

    expect(toSpans(rectangles)).toStrictEqual([
      [
        [0, 1],
        [0, 1],
      ],
      [
        [0, 1],
        [1, 2],
      ],
    ]);
  });
});
