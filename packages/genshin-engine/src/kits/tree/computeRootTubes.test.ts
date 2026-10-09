import type { TreeRoot } from "#src/models/kits/tree/TreeRoot";

import { computeRootTubes } from "#src/kits/tree/computeRootTubes";
import { Triangle, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeRootTubes, () => {
  // A root bending a quarter turn, each span a metre, so each is cut in two sections and every second ring stands at
  // One of its points
  const root: TreeRoot = [
    { radius: 1, x: 0, y: 0, z: 0 },
    { radius: 0.5, x: 1, y: 0, z: 0 },
    { radius: 0, x: 1, y: 0, z: 1 },
  ];
  // A ring's vertices, its first side repeated at its seam
  const ringVertexCount = 7;
  // Positions and normals are each rounded to single precision on their own, so they agree to that precision
  const precision = 1e-6;

  test("runs its tube through every point at that point's radius", () => {
    expect.hasAssertions();

    const { positions } = computeRootTubes([root]);
    const deviations = root.flatMap(({ radius, x, y, z }, pointIndex) =>
      Array.from({ length: ringVertexCount }, (_value, side) =>
        Math.abs(
          new Vector3()
            .fromArray(positions, (pointIndex * 2 * ringVertexCount + side) * 3)
            .distanceTo(new Vector3(x, y, z)) - radius,
        ),
      ),
    );

    expect(Math.max(...deviations)).toBeLessThan(precision);
  });

  test("winds every triangle outward, the way its vertices' normals point", () => {
    expect.hasAssertions();

    const { indices, normals, positions } = computeRootTubes([root]);
    const toCorner = (vertex: number): Vector3 => new Vector3().fromArray(positions, vertex * 3);
    const facings = Array.from({ length: indices.length / 3 }, (_value, face) => {
      const [first = 0, second = 0, third = 0] = indices.subarray(face * 3, face * 3 + 3);
      const faceNormal = new Triangle(toCorner(first), toCorner(second), toCorner(third)).getNormal(new Vector3());
      // A triangle closing on the tip's point has no facing of its own
      return faceNormal.lengthSq() === 0 ? 1 : faceNormal.dot(new Vector3().fromArray(normals, first * 3));
    });

    expect(Math.min(...facings)).toBeGreaterThan(0);
  });
});
