import type { MeshBounds } from "#src/models/genshinAssets/bounds/MeshBounds";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The lowest and the highest of a mesh's vertices on each axis, in the game's own axes and in metres as Unity keeps them.
// A mesh with no vertices has no bounds to read, so it is refused rather than measured as infinite
export const computeMeshBounds = (vertices: [number, number, number][]): MeshBounds => {
  if (vertices.length === 0) throw new InvalidOperationError(Operation.Read, computeMeshBounds.name, "has no vertices");
  const minimum: MeshBounds["minimum"] = [Infinity, Infinity, Infinity];
  const maximum: MeshBounds["maximum"] = [-Infinity, -Infinity, -Infinity];
  for (const vertex of vertices)
    for (let axis = 0; axis < 3; axis++) {
      minimum[axis] = Math.min(minimum[axis], vertex[axis]);
      maximum[axis] = Math.max(maximum[axis], vertex[axis]);
    }
  return { maximum, minimum };
};
