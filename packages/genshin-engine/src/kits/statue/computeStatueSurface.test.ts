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
  test("closes its sections into a solid that faces out, lofted between their radii", () => {
    expect.hasAssertions();

    // Each section's square of radius r has an area of 2r squared, and the radius lofts linearly from 1 at the first
    // Section's middle to 2 at the second's, so the stack is 2 * 1 * 0.5 + 14 / 3 + 2 * 4 * 0.5 cubic metres
    const { indices, positions } = computeStatueSurface([
      { centre: [0, 0], height: 1, radii: [1, 1, 1, 1] },
      { centre: [0, 0], height: 1, radii: [2, 2, 2, 2] },
    ]);

    expect(computeVolume({ indices, positions })).toBeCloseTo(29 / 3);
  });

  test("stands each ring about its section's centre, so a stack that bends keeps the volume it has upright", () => {
    expect.hasAssertions();

    // Each height's square is the upright stack's moved along x, so its area and the stack's volume are unchanged, and
    // The second ring's +x corner stands at its centre's 1 plus its radius's 2
    const { indices, positions } = computeStatueSurface([
      { centre: [0, 0], height: 1, radii: [1, 1, 1, 1] },
      { centre: [1, 0], height: 1, radii: [2, 2, 2, 2] },
    ]);

    expect(computeVolume({ indices, positions })).toBeCloseTo(29 / 3);
    expect(Math.max(...positions.filter((_value, index) => index % 3 === 0))).toBeCloseTo(3);
  });
});
