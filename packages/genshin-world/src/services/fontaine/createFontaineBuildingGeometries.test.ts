import {
  FONTAINE_GROUND_FLOOR_HEIGHT,
  FONTAINE_MANSARD_LOWER_HEIGHT,
  FONTAINE_MANSARD_UPPER_HEIGHT,
  FONTAINE_STOREY_HEIGHT,
} from "#src/services/fontaine/constants";
import { createFontaineBuildingGeometries } from "#src/services/fontaine/createFontaineBuildingGeometries";
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
    const roofBaseY = FONTAINE_GROUND_FLOOR_HEIGHT + STOREY_COUNT * FONTAINE_STOREY_HEIGHT;
    const roof = new Box3().setFromBufferAttribute(slateGeometry.getAttribute("position"));

    expect(roof.min.y).toBeCloseTo(roofBaseY);
    expect(roof.max.y).toBeCloseTo(roofBaseY + FONTAINE_MANSARD_LOWER_HEIGHT + FONTAINE_MANSARD_UPPER_HEIGHT);
    expect(roof.min.x).toBeCloseTo(-(BAY_COUNT * BAY_WIDTH) / 2);
    expect(roof.max.x).toBeCloseTo((BAY_COUNT * BAY_WIDTH) / 2);
  });
});
