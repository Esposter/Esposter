import { createPropGeometry } from "#src/kits/props/createPropGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createPropGeometry, () => {
  test("draws a hull's boxes where the outline holds them", () => {
    expect.hasAssertions();

    const geometry = createPropGeometry({
      boxes: [
        [0, 0, 0, 1, 2, 3],
        [1, 0, 0, 2, 1, 1],
      ],
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.toArray()).toStrictEqual([0, 0, 0]);
    expect(max.toArray()).toStrictEqual([2, 2, 3]);
  });

  test("stands a lathe's sections on its foot, about its axis", () => {
    expect.hasAssertions();

    const geometry = createPropGeometry({
      axis: [5, -3],
      foot: 4,
      sections: [
        { bottomRadius: 2, height: 1, topRadius: 2 },
        { bottomRadius: 1, height: 2, topRadius: 1 },
      ],
    });
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.toArray()).toStrictEqual([3, 4, -5]);
    expect(max.toArray()).toStrictEqual([7, 7, -1]);
  });
});
