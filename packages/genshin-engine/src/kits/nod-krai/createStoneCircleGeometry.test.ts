import { createStoneCircleGeometry } from "#src/kits/nod-krai/createStoneCircleGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createStoneCircleGeometry, () => {
  test("stands each stone on the ring with its thickness across the radius", () => {
    expect.hasAssertions();

    const geometry = createStoneCircleGeometry({
      pillarCount: 4,
      pillarHeight: 3,
      pillarThickness: 1,
      pillarWidth: 2,
      radius: 10,
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.y).toBeCloseTo(0);
    expect(max.y).toBeCloseTo(3);
    expect(max.x).toBeCloseTo(10.5);
    expect(min.x).toBeCloseTo(-10.5);
    expect(max.z).toBeCloseTo(10.5);
    expect(min.z).toBeCloseTo(-10.5);
  });
});
