import { createFlowerTileGeometry } from "#src/vegetation/createFlowerTileGeometry";
import { Box3, Matrix4, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createFlowerTileGeometry, () => {
  test("draws an instance a matrix, bounded by its largest scale out from where it stands", () => {
    expect.hasAssertions();

    const matrices = new Float32Array([
      ...new Matrix4().makeScale(1, 2, 1).setPosition(1, 0, 0).toArray(),
      ...new Matrix4().setPosition(-1, 0, 0).toArray(),
    ]);
    const geometry = createFlowerTileGeometry(matrices, new Float32Array(6));

    expect(geometry.instanceCount).toBe(2);
    expect(geometry.boundingBox).toStrictEqual(new Box3(new Vector3(-3, -2, -2), new Vector3(3, 2, 2)));
  });
});
