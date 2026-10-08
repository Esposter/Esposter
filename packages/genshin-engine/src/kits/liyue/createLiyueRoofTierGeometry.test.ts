import { ROOF_RING_COUNT, ROOF_SIDE_SEGMENTS } from "#src/kits/liyue/constants";
import { createLiyueRoofTierGeometry } from "#src/kits/liyue/createLiyueRoofTierGeometry";
import { describe, expect, test } from "vitest";

describe(createLiyueRoofTierGeometry, () => {
  test("rises from its eave to a flat top whose faces point up", () => {
    expect.hasAssertions();

    const geometry = createLiyueRoofTierGeometry({ baseY: 0, halfDepth: 4, halfWidth: 4 });
    const topRingStart = ROOF_RING_COUNT * 4 * ROOF_SIDE_SEGMENTS;

    expect(geometry.getAttribute("normal").getY(topRingStart)).toBeGreaterThan(0);
  });
});
