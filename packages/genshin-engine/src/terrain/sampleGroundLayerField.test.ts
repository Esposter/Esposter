import type { GroundLayerField } from "#src/models/terrain/GroundLayerField";

import { GroundLayer } from "#src/models/terrain/GroundLayer";
import { sampleGroundLayerField } from "#src/terrain/sampleGroundLayerField";
import { describe, expect, test } from "vitest";

describe(sampleGroundLayerField, () => {
  const field: GroundLayerField = {
    cellSize: 2,
    layers: { [GroundLayer.Earth]: [0, 1, 0, 1], [GroundLayer.Grass]: [1, 0, 1, 0] },
    origin: [0, 0],
    size: [2, 2],
  };
  const none: Record<GroundLayer, number> = {
    [GroundLayer.Earth]: 0,
    [GroundLayer.Grass]: 0,
    [GroundLayer.Path]: 0,
    [GroundLayer.Rock]: 0,
    [GroundLayer.Sand]: 0,
    [GroundLayer.Snow]: 0,
  };

  test.each([
    ["blends the nodes round a point", 1, 1, { ...none, [GroundLayer.Earth]: 0.5, [GroundLayer.Grass]: 0.5 }],
    ["keeps a point past the grid to its edge", 5, -5, { ...none, [GroundLayer.Earth]: 1 }],
  ])("%s", (_name, x, z, expected) => {
    expect.hasAssertions();

    const weights = { ...none };
    sampleGroundLayerField(field, x, z, weights);

    expect(weights).toStrictEqual(expected);
  });

  test("paints all grass where the field names no layer", () => {
    expect.hasAssertions();

    const weights = { ...none };
    sampleGroundLayerField({ ...field, layers: {} }, 1, 1, weights);

    expect(weights).toStrictEqual({ ...none, [GroundLayer.Grass]: 1 });
  });
});
