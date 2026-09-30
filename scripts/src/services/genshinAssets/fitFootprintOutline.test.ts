import { fitFootprintOutline } from "#src/services/genshinAssets/fitFootprintOutline";
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
});
