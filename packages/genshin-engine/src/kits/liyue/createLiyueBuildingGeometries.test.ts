import { FINIAL_SECTIONS, ROOF_TIER_HEIGHT, TERRACE_HEIGHT } from "#src/kits/liyue/constants";
import { createLiyueBuildingGeometries } from "#src/kits/liyue/createLiyueBuildingGeometries";
import { describe, expect, test } from "vitest";

describe(createLiyueBuildingGeometries, () => {
  test("stacks each roof tier one tier's height above the one below, its finials topping the highest", () => {
    expect.hasAssertions();

    const storeyHeight = 3;
    const { roof } = createLiyueBuildingGeometries({ depth: 6, roofTierCount: 2, storeyHeight, width: 6 });
    roof.computeBoundingBox();
    const finialHeight = FINIAL_SECTIONS.reduce((sum, { height }) => sum + height, 0);

    expect(roof.boundingBox?.max.y).toBeCloseTo(TERRACE_HEIGHT + storeyHeight + ROOF_TIER_HEIGHT * 2 + finialHeight);
  });
});
