import type { WindrisePlant } from "#src/models/windrise/WindrisePlant";

import { composePlantPlaceMatrix } from "#src/services/world/composePlantPlaceMatrix";
import { Matrix4, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(composePlantPlaceMatrix, () => {
  test("A placed tree stands where the game places it", () => {
    expect.hasAssertions();

    const place: WindrisePlant["places"][number] = {
      position: { x: 3, z: -2 },
      rotation: Math.PI / 2,
      scale: [1.5, 2, 0.5],
    };
    const matrix = composePlantPlaceMatrix(new Matrix4(), place, () => 4, new Vector3(0.5, 1, 2));

    expect(new Vector3().setFromMatrixPosition(matrix).toArray()).toStrictEqual([3, 4, -2]);
    const turned = new Vector3(1, 0, 0).transformDirection(matrix);
    expect(turned.x).toBeCloseTo(0);
    expect(turned.z).toBeCloseTo(-1);
    expect(new Vector3().setFromMatrixColumn(matrix, 0).length()).toBeCloseTo(0.75);
    expect(new Vector3().setFromMatrixColumn(matrix, 1).length()).toBeCloseTo(2);
    expect(new Vector3().setFromMatrixColumn(matrix, 2).length()).toBeCloseTo(1);
  });
});
