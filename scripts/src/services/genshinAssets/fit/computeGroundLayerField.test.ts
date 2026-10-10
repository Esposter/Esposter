import { computeGroundLayerField } from "#src/services/genshinAssets/fit/computeGroundLayerField";
import { describe, expect, test } from "vitest";

describe(computeGroundLayerField, () => {
  test("splats each point onto its nodes by nearness and floods the nodes no point reaches", () => {
    expect.hasAssertions();

    expect(
      computeGroundLayerField(
        [
          { layer: "A", x: 0, z: 0 },
          { layer: "A", x: 1, z: 0 },
          { layer: "B", x: 2, z: 0 },
        ],
        { cellSize: 2, origin: [0, 0], size: [3, 2] },
      ),
    ).toStrictEqual({
      cellSize: 2,
      layers: { A: [1, 0.33, 0.33, 1, 0.33, 0.33], B: [0, 0.67, 0.67, 0, 0.67, 0.67] },
      origin: [0, 0],
      size: [3, 2],
    });
  });
});
