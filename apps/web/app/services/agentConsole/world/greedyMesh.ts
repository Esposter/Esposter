import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { VoxelMesh } from "@/models/agentConsole/world/VoxelMesh";
import type { Vector3Tuple } from "three";

import { getVoxel } from "@/services/agentConsole/world/getVoxel";
// How lit a face is by the way it faces, so the world needs no light: tops brightest, then the two sides, then below
const AXIS_SHADES: readonly [Vector3Tuple, Vector3Tuple] = [
  // Facing +x, +y, +z
  [0.8, 1, 0.65],
  // Facing -x, -y, -z
  [0.8, 0.5, 0.65],
];
// How lit a corner is by how many of the three voxels around it are solid, from boxed in to open
const AMBIENT_OCCLUSION_SHADES = [0.55, 0.7, 0.85, 1];
// The corners of a face in its own two axes, in winding order
const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;
// Static voxels as one mesh. A face between two solid voxels is never emitted, and neighbouring faces of one colour and
// One ambient occlusion become one quad, so the triangle count follows the surface and not the volume. Occlusion is
// Counted from each corner's solid neighbours and baked into the vertex colours with the face's shade. Voxels within
// The border of the grid's x and z edges are read, for the faces and occlusion beside them, but not meshed
export const greedyMesh = (voxelGrid: VoxelGrid, rgbs: readonly Vector3Tuple[], border = 0): VoxelMesh => {
  const { depth, height, width } = voxelGrid;
  const dimensions = [width, height, depth];
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const position = [0, 0, 0];
  const neighbour = [0, 0, 0];

  for (let axis = 0; axis < 3; axis++) {
    const uAxis = (axis + 1) % 3;
    const vAxis = (axis + 2) % 3;
    const uSize = dimensions[uAxis] ?? 0;
    const vSize = dimensions[vAxis] ?? 0;
    const mask = new Int32Array(uSize * vSize);
    const isSolid = (offsetAxis: number, offsetU: number, offsetV: number) => {
      neighbour[axis] = (position[axis] ?? 0) + offsetAxis;
      neighbour[uAxis] = (position[uAxis] ?? 0) + offsetU;
      neighbour[vAxis] = (position[vAxis] ?? 0) + offsetV;
      return getVoxel(voxelGrid, neighbour[0] ?? 0, neighbour[1] ?? 0, neighbour[2] ?? 0) > 0 ? 1 : 0;
    };

    for (const direction of [1, -1])
      for (let slice = 0; slice < (dimensions[axis] ?? 0); slice++) {
        position[axis] = slice;
        // Each face this slice shows, keyed by its colour and its four corners' occlusion so only equal faces merge
        for (let v = 0; v < vSize; v++)
          for (let u = 0; u < uSize; u++) {
            position[uAxis] = u;
            position[vAxis] = v;
            const x = position[0] ?? 0;
            const z = position[2] ?? 0;
            const color = getVoxel(voxelGrid, x, position[1] ?? 0, z);
            if (
              color === 0 ||
              x < border ||
              z < border ||
              x >= width - border ||
              z >= depth - border ||
              isSolid(direction, 0, 0)
            ) {
              mask[u + v * uSize] = 0;
              continue;
            }

            let key = color;
            for (const [cornerIndex, [cornerU, cornerV]] of CORNERS.entries()) {
              const side1 = isSolid(direction, cornerU, 0);
              const side2 = isSolid(direction, 0, cornerV);
              const occlusion = side1 && side2 ? 0 : 3 - side1 - side2 - isSolid(direction, cornerU, cornerV);
              key |= occlusion << (8 + cornerIndex * 2);
            }
            mask[u + v * uSize] = key;
          }

        for (let v = 0; v < vSize; v++)
          for (let u = 0; u < uSize;) {
            const key = mask[u + v * uSize] ?? 0;
            if (key === 0) {
              u++;
              continue;
            }

            let quadWidth = 1;
            while (u + quadWidth < uSize && mask[u + quadWidth + v * uSize] === key) quadWidth++;
            let quadHeight = 1;
            while (
              v + quadHeight < vSize &&
              Array.from({ length: quadWidth }, (_, offset) => mask[u + offset + (v + quadHeight) * uSize]).every(
                (otherKey) => otherKey === key,
              )
            )
              quadHeight++;
            for (let clearV = v; clearV < v + quadHeight; clearV++)
              mask.fill(0, u + clearV * uSize, u + quadWidth + clearV * uSize);

            const vertexIndex = positions.length / 3;
            const rgb = rgbs[(key & 0xff) - 1] ?? [1, 1, 1];
            const shade = AXIS_SHADES[direction === 1 ? 0 : 1][axis] ?? 1;
            const occlusions = CORNERS.map((_, cornerIndex) => (key >> (8 + cornerIndex * 2)) & 3);
            for (const [cornerIndex, [cornerU, cornerV]] of CORNERS.entries()) {
              const vertex = [0, 0, 0];
              vertex[axis] = slice + (direction === 1 ? 1 : 0);
              vertex[uAxis] = cornerU === -1 ? u : u + quadWidth;
              vertex[vAxis] = cornerV === -1 ? v : v + quadHeight;
              positions.push(...vertex);
              const light = shade * (AMBIENT_OCCLUSION_SHADES[occlusions[cornerIndex] ?? 3] ?? 1);
              colors.push(rgb[0] * light, rgb[1] * light, rgb[2] * light);
            }
            // The corners wind counterclockwise seen from the side the face points to, reversed for the far side; the
            // Diagonal runs between the brighter pair so occlusion shades evenly across the quad
            const [first = 0, second = 0, third = 0, fourth = 0] = occlusions;
            const quad = first + third > second + fourth ? [0, 1, 2, 0, 2, 3] : [1, 2, 3, 1, 3, 0];
            const orderedQuad = direction === 1 ? quad : quad.toReversed();
            indices.push(...orderedQuad.map((corner) => vertexIndex + corner));
            u += quadWidth;
          }
      }
  }

  return {
    colors: Float32Array.from(colors),
    indices: Uint32Array.from(indices),
    positions: Float32Array.from(positions),
  };
};
