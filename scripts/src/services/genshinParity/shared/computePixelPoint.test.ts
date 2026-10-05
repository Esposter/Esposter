import { computePixelPoint } from "#src/services/genshinParity/shared/computePixelPoint";
import { PerspectiveCamera } from "three";
import { describe, expect, test } from "vitest";

describe(computePixelPoint, () => {
  const camera = new PerspectiveCamera(90, 1, 0.1, 100);
  camera.position.set(0, 1, 0);
  camera.updateMatrixWorld();
  const matrices = { matrixWorld: camera.matrixWorld, projectionMatrixInverse: camera.projectionMatrixInverse };
  const size = { height: 2, width: 2 };

  test("places a pixel at its depth along the view, off the axis by its ray's slope", () => {
    expect.hasAssertions();

    const { x, y, z } = computePixelPoint(0, size, 2, matrices);

    expect(x).toBeCloseTo(-1);
    expect(y).toBeCloseTo(2);
    expect(z).toBeCloseTo(-2);
  });
});
