import {
  GROUND_FLOOR_HEIGHT,
  MANSARD_LOWER_HEIGHT,
  MANSARD_UPPER_HEIGHT,
  STOREY_HEIGHT,
} from "#src/kits/fontaine/constants";
import { createFontaineBuildingGeometries } from "#src/kits/fontaine/createFontaineBuildingGeometries";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFontaineBuildingGeometries, () => {
  test("roofs its storeys over the width of its bays", () => {
    expect.hasAssertions();

    const BAY_COUNT = 3;
    const BAY_WIDTH = 4;
    const STOREY_COUNT = 2;
    const { slateGeometry } = createFontaineBuildingGeometries({
      bayCount: BAY_COUNT,
      bayWidth: BAY_WIDTH,
      depth: 10,
      storeyCount: STOREY_COUNT,
    });
    const roofBaseY = GROUND_FLOOR_HEIGHT + STOREY_COUNT * STOREY_HEIGHT;
    const roof = new Box3().setFromBufferAttribute(slateGeometry.getAttribute("position"));

    expect(roof.min.y).toBeCloseTo(roofBaseY);
    expect(roof.max.y).toBeCloseTo(roofBaseY + MANSARD_LOWER_HEIGHT + MANSARD_UPPER_HEIGHT);
    expect(roof.min.x).toBeCloseTo(-(BAY_COUNT * BAY_WIDTH) / 2);
    expect(roof.max.x).toBeCloseTo((BAY_COUNT * BAY_WIDTH) / 2);
  });
});
