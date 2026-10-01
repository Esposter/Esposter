import { rasterizeTopFaces } from "#src/services/genshinAssets/rasterizeTopFaces";
import { describe, expect, test } from "vitest";

describe(rasterizeTopFaces, () => {
  const grid = { cellSize: 1, corner: [0, 0], height: 1, width: 2 } as const;
  const values = [
    [0, 0],
    [2, 0],
    [0, 2],
  ] as const;

  test("keeps the face standing highest over a cell, its value read at the cell's middle", () => {
    expect.hasAssertions();

    const low = {
      corners: [
        [0, 0, 0],
        [2, 0, 0],
        [0, 0, 2],
      ],
      tag: 0,
      values,
    } as const;
    const high = {
      corners: [
        [0, 1, 0],
        [2, 1, 0],
        [0, 1, 2],
      ],
      tag: 1,
      values,
    } as const;
    const { tags, values: cellValues } = rasterizeTopFaces([low, high], grid);

    expect([...tags]).toStrictEqual([1, 1]);
    expect([...cellValues]).toStrictEqual([0.5, 0.5, 1.5, 0.5]);
  });

  test("leaves a cell no face covers untagged", () => {
    expect.hasAssertions();

    const { tags } = rasterizeTopFaces(
      [
        {
          corners: [
            [0, 0, 0],
            [1, 0, 0],
            [0, 0, 1],
          ],
          tag: 0,
          values,
        },
      ],
      grid,
    );

    expect([...tags]).toStrictEqual([0, -1]);
  });
});
