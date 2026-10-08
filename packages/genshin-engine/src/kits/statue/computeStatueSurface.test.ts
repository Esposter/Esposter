import type { StatueSurface } from "#src/models/kits/statue/StatueSurface";

import { computeStatueSurface } from "#src/kits/statue/computeStatueSurface";
import { BufferAttribute, Vector3 } from "three";
import { describe, expect, test } from "vitest";

// The signed volume of a closed surface, the sum of each triangle's tetrahedron to the origin, which is positive only
// Where every triangle faces out
const computeVolume = ({ indices, positions }: StatueSurface): number => {
  const position = new BufferAttribute(positions, 3);
  const corner = (vertex: number): Vector3 =>
    new Vector3(position.getX(vertex), position.getY(vertex), position.getZ(vertex));
  let volume = 0;
  for (let index = 0; index < indices.length; index += 3)
    volume += corner(indices[index] ?? 0).dot(corner(indices[index + 1] ?? 0).cross(corner(indices[index + 2] ?? 0)));
  return volume / 6;
};

describe(computeStatueSurface, () => {
  test("closes its sections into a solid that faces out, the ledge between two radii included", () => {
    expect.hasAssertions();

    // Each section's square of radius r has an area of 2r squared, so the stack is 2 * 1 + 2 * 4 cubic metres
    const { indices, positions } = computeStatueSurface([
      { height: 1, radii: [1, 1, 1, 1] },
      { height: 1, radii: [2, 2, 2, 2] },
    ]);

    expect(computeVolume({ indices, positions })).toBeCloseTo(10);
  });
});
