import { LIYUE_FINIAL_SECTIONS, LIYUE_ROOF_TIER_HEIGHT, LIYUE_TERRACE_HEIGHT } from "#src/services/liyue/constants";
import { createLiyueBuildingGeometries } from "#src/services/liyue/createLiyueBuildingGeometries";
import { describe, expect, test } from "vitest";

describe(createLiyueBuildingGeometries, () => {
  test("stacks each roof tier one tier's height above the one below, its finials topping the highest", () => {
    expect.hasAssertions();

    const storeyHeight = 3;
    const { roof } = createLiyueBuildingGeometries({ depth: 6, roofTierCount: 2, storeyHeight, width: 6 });
    roof.computeBoundingBox();
    const finialHeight = LIYUE_FINIAL_SECTIONS.reduce((sum, { height }) => sum + height, 0);

    expect(roof.boundingBox?.max.y).toBeCloseTo(
      LIYUE_TERRACE_HEIGHT + storeyHeight + LIYUE_ROOF_TIER_HEIGHT * 2 + finialHeight,
    );
  });
});
