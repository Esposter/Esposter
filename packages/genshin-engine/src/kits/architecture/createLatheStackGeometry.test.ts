import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLatheStackGeometry, () => {
  const radialSegments = 8;

  test("stands each section on the one below, from the origin up", () => {
    expect.hasAssertions();

    const geometry = createLatheStackGeometry({
      isFaceted: true,
      radialSegments,
      sections: [
        { bottomRadius: 2, height: 1, topRadius: 2 },
        { bottomRadius: 1, height: 2, topRadius: 1 },
      ],
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.y).toBe(0);
    expect(max.y).toBe(3);
    expect(max.x).toBe(2);
  });
});
