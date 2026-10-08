import { LIYUE_ROOF_RING_COUNT, LIYUE_ROOF_SIDE_SEGMENTS } from "#src/services/liyue/constants";
import { createLiyueRoofTierGeometry } from "#src/services/liyue/createLiyueRoofTierGeometry";
import { describe, expect, test } from "vitest";

describe(createLiyueRoofTierGeometry, () => {
  test("rises from its eave to a flat top whose faces point up", () => {
    expect.hasAssertions();

    const geometry = createLiyueRoofTierGeometry({ baseY: 0, halfDepth: 4, halfWidth: 4 });
    const topRingStart = LIYUE_ROOF_RING_COUNT * 4 * LIYUE_ROOF_SIDE_SEGMENTS;

    expect(geometry.getAttribute("normal").getY(topRingStart)).toBeGreaterThan(0);
  });
});
