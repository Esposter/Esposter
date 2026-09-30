import { createSilhouetteGeometry } from "#src/kits/architecture/createSilhouetteGeometry";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createSilhouetteGeometry, () => {
  test("extrudes a ring through its depth and leaves its hole open", () => {
    expect.hasAssertions();

    const mesh = new Mesh(
      createSilhouetteGeometry({
        contours: [
          [
            [0, 0],
            [4, 0],
            [4, 4],
            [0, 4],
          ],
          [
            [1, 1],
            [1, 3],
            [3, 3],
            [3, 1],
          ],
        ],
        depth: [-1, 1],
      }),
      new MeshBasicMaterial({ side: DoubleSide }),
    );
    const castAlongZ = (x: number, y: number): number[] =>
      new Raycaster(new Vector3(x, y, 5), new Vector3(0, 0, -1))
        .intersectObject(mesh)
        .map(({ point }) => Math.round(point.z));

    expect(castAlongZ(0.3, 0.6)).toStrictEqual([1, -1]);
    expect(castAlongZ(2, 2)).toStrictEqual([]);
  });
});
