import { GroundLayer } from "#src/models/terrain/GroundLayer";
import { createGroundLayerWeights } from "#src/terrain/createGroundLayerWeights";
import { describe, expect, test } from "vitest";

describe(createGroundLayerWeights, () => {
  const getWeights = createGroundLayerWeights({
    earthSlope: { end: 1, start: 0 },
    pathFalloff: 1,
    paths: [{ endX: 10, endZ: 0, startX: 0, startZ: 0, width: 2 }],
    rockSlope: { end: 1, start: 0.5 },
    sandHeight: { end: 0, start: 1 },
    snowHeight: { end: 11, start: 10 },
  });
  const none: Record<GroundLayer, number> = {
    [GroundLayer.Earth]: 0,
    [GroundLayer.Grass]: 0,
    [GroundLayer.Path]: 0,
    [GroundLayer.Rock]: 0,
    [GroundLayer.Sand]: 0,
    [GroundLayer.Snow]: 0,
  };

  test.each([
    ["grass on flat ground", 5, 0, 0, 50, { ...none, [GroundLayer.Grass]: 1 }],
    ["earth half over grass on a bank", 5, 0.5, 0, 50, { ...none, [GroundLayer.Earth]: 0.5, [GroundLayer.Grass]: 0.5 }],
    ["rock over earth where sheer", 5, 1, 0, 50, { ...none, [GroundLayer.Rock]: 1 }],
    ["sand at the shore", 0, 0, 0, 50, { ...none, [GroundLayer.Sand]: 1 }],
    ["snow above the snow line", 11, 0, 0, 50, { ...none, [GroundLayer.Snow]: 1 }],
    ["path along its segment", 5, 0, 5, 0, { ...none, [GroundLayer.Path]: 1 }],
  ])("paints %s", (_name, height, slope, x, z, expected) => {
    expect.hasAssertions();

    expect(getWeights(height, slope, x, z)).toStrictEqual(expected);
  });

  test("paints the field's shares in place of grass, with no slope rule over them", () => {
    expect.hasAssertions();

    const getFieldWeights = createGroundLayerWeights({
      layerField: { cellSize: 1, layers: { [GroundLayer.Earth]: [1] }, origin: [0, 0], size: [1, 1] },
      pathFalloff: 1,
      paths: [],
    });

    expect(getFieldWeights(5, 1, 0, 0)).toStrictEqual({ ...none, [GroundLayer.Earth]: 1 });
  });
});
