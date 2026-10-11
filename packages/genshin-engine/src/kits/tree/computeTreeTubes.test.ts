import type { TreeTube } from "#src/models/kits/tree/TreeTube";

import { computeTreeTubes } from "#src/kits/tree/computeTreeTubes";
import { Triangle, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeTreeTubes, () => {
  // A tube bending a quarter turn, each span a metre, so each is cut in two sections and every second ring stands at
  // One of its points
  const tube: TreeTube = [
    { radius: 1, x: 0, y: 0, z: 0 },
    { radius: 0.5, x: 1, y: 0, z: 0 },
    { radius: 0, x: 1, y: 0, z: 1 },
  ];
  // A ring's vertices, its seven sides keeping each within a metre round its widest ring, its first repeated at its seam
  const ringVertexCount = 8;
  // Positions and normals are each rounded to single precision on their own, so they agree to that precision
  const precision = 1e-6;

  test("runs its tube through every point at that point's radius", () => {
    expect.hasAssertions();

    const { positions } = computeTreeTubes([tube]);
    const deviations = tube.flatMap(({ radius, x, y, z }, pointIndex) =>
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

  test("gives a wide tube's rings as many sides as keep each within a metre", () => {
    expect.hasAssertions();

    // A straight tube five metres wide and a metre long, so three rings, its first side repeated at each seam
    const { positions } = computeTreeTubes([
      [
        { radius: 5, x: 0, y: 0, z: 0 },
        { radius: 5, x: 0, y: 1, z: 0 },
      ],
    ]);
    const sideCount = positions.length / 3 / 3 - 1;
    const sideLengths = Array.from({ length: sideCount }, (_value, side) =>
      new Vector3().fromArray(positions, side * 3).distanceTo(new Vector3().fromArray(positions, (side + 1) * 3)),
    );

    expect(Math.max(...sideLengths)).toBeLessThanOrEqual(1);
  });

  test("winds every triangle outward, the way its vertices' normals point", () => {
    expect.hasAssertions();

    const { indices, normals, positions } = computeTreeTubes([tube]);
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
