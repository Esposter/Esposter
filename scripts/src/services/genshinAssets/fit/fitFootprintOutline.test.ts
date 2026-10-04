import { fitFootprintOutline } from "#src/services/genshinAssets/fit/fitFootprintOutline";
import { describe, expect, test } from "vitest";

describe(fitFootprintOutline, () => {
  const cellSize = 1;
  const tolerance = 0.01;

  test("outlines a rectangle drawn as two triangles by its four corners", () => {
    expect.hasAssertions();

    const outline = fitFootprintOutline(
      [
        [
          [0, 0],
          [4, 0],
          [4, 10],
        ],
        [
          [0, 0],
          [4, 10],
          [0, 10],
        ],
      ],
      { cellSize, tolerance },
    );

    expect(outline).toStrictEqual([
      [4, 0],
      [4, 10],
      [0, 10],
      [0, 0],
    ]);
  });

  test("keeps a slab's own ends between the grid's rows", () => {
    expect.hasAssertions();

    const outline = fitFootprintOutline(
      [
        [
          [0, 0.5],
          [4, 0.5],
          [4, 1.5],
        ],
        [
          [0, 0.5],
          [4, 1.5],
          [0, 1.5],
        ],
      ],
      { cellSize, tolerance },
    );

    expect(outline).toStrictEqual([
      [4, 0.5],
      [4, 1.5],
      [0, 1.5],
      [0, 0.5],
    ]);
  });
});
