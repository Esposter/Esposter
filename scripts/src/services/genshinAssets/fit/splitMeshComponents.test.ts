import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";
import { describe, expect, test } from "vitest";

describe(splitMeshComponents, () => {
  test("joins triangles whose corners stand at one place under different indices, and no others", () => {
    expect.hasAssertions();

    // Vertices 1 and 3 stand at one place, as an export splits a vertex along a texture's seam, and 5 to 7 apart
    expect(
      splitMeshComponents(
        [
          [0, 0, 0],
          [1, 0, 0],
          [0, 1, 0],
          [1, 0, 0],
          [1, 1, 0],
          [5, 0, 0],
          [6, 0, 0],
          [5, 1, 0],
        ],
        [
          [0, 1, 2],
          [3, 4, 2],
          [5, 6, 7],
        ],
      ),
    ).toStrictEqual([[0, 1], [2]]);
  });
});
