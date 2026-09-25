import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { VoxelMesh } from "@/models/agentConsole/world/VoxelMesh";
import type { Vector3Tuple } from "three";

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
// A quad's two triangles, split along one diagonal or the other, wound for a face pointing along its axis or against it
const QUAD_INDICES = [0, 1, 2, 0, 2, 3];
const FLIPPED_QUAD_INDICES = [1, 2, 3, 1, 3, 0];
const REVERSED_QUAD_INDICES = QUAD_INDICES.toReversed();
const REVERSED_FLIPPED_QUAD_INDICES = FLIPPED_QUAD_INDICES.toReversed();
// Whether any voxel of a layer is solid
const checkIsLayerOccupied = ({ depth, height, voxels, width }: VoxelGrid, y: number) => {
  for (let z = 0; z < depth; z++) for (let x = 0; x < width; x++) if (voxels[x + width * (y + height * z)]) return true;
  return false;
};
// Static voxels as one mesh. A face between two solid voxels is never emitted, and neighbouring faces of one colour and
// One ambient occlusion become one quad, so the triangle count follows the surface and not the volume. Occlusion is
// Counted from each corner's solid neighbours and baked into the vertex colours with the face's shade. Voxels within
// The border of the grid's x and z edges are read, for the faces and occlusion beside them, but not meshed, and the
// Mesh is placed from the border's inner corner. Nothing over the highest solid voxel is visited, so open sky costs
// Nothing
export const greedyMesh = (voxelGrid: VoxelGrid, rgbs: readonly Vector3Tuple[], border = 0): VoxelMesh => {
  const { depth, height, voxels, width } = voxelGrid;
  const layerSize = width * height;
  let surfaceHeight = height;
  while (surfaceHeight > 0 && !checkIsLayerOccupied(voxelGrid, surfaceHeight - 1)) surfaceHeight--;
  // The extent visited along each axis, which the sky over the surface is left out of
  const extents = [width, surfaceHeight, depth];
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const cell = [0, 0, 0];
  const vertex = [0, 0, 0];
  const countSolid = (x: number, y: number, z: number) =>
    x >= 0 && y >= 0 && z >= 0 && x < width && y < height && z < depth && voxels[x + width * y + layerSize * z] ? 1 : 0;

  for (let axis = 0; axis < 3; axis++) {
    const uAxis = (axis + 1) % 3;
    const vAxis = (axis + 2) % 3;
    const uSize = extents[uAxis] ?? 0;
    const vSize = extents[vAxis] ?? 0;
    // A step along each of the face's axes, as x, y and z
    const [axisStepX, axisStepY, axisStepZ] = [Number(axis === 0), Number(axis === 1), Number(axis === 2)];
    const [uStepX, uStepY, uStepZ] = [Number(uAxis === 0), Number(uAxis === 1), Number(uAxis === 2)];
    const [vStepX, vStepY, vStepZ] = [Number(vAxis === 0), Number(vAxis === 1), Number(vAxis === 2)];
    const mask = new Int32Array(uSize * vSize);
    const checkIsRowKey = (start: number, length: number, key: number) => {
      for (let offset = 0; offset < length; offset++) if (mask[start + offset] !== key) return false;
      return true;
    };

    for (const direction of [1, -1])
      for (let slice = 0; slice < (extents[axis] ?? 0); slice++) {
        cell[axis] = slice;
        // Each face this slice shows, keyed by its colour and its four corners' occlusion so only equal faces merge
        for (let v = 0; v < vSize; v++)
          for (let u = 0; u < uSize; u++) {
            cell[uAxis] = u;
            cell[vAxis] = v;
            const [x = 0, y = 0, z = 0] = cell;
            const color = voxels[x + width * y + layerSize * z] ?? 0;
            // The voxel the face looks into, which hides it if solid and shades its corners from its neighbours
            const frontX = x + direction * axisStepX;
            const frontY = y + direction * axisStepY;
            const frontZ = z + direction * axisStepZ;
            if (
              color === 0 ||
              x < border ||
              z < border ||
              x >= width - border ||
              z >= depth - border ||
              countSolid(frontX, frontY, frontZ)
            ) {
              mask[u + v * uSize] = 0;
              continue;
            }

            let key = color;
            for (const [cornerIndex, [cornerU, cornerV]] of CORNERS.entries()) {
              const side1 = countSolid(frontX + cornerU * uStepX, frontY + cornerU * uStepY, frontZ + cornerU * uStepZ);
              const side2 = countSolid(frontX + cornerV * vStepX, frontY + cornerV * vStepY, frontZ + cornerV * vStepZ);
              const occlusion =
                side1 && side2
                  ? 0
                  : 3 -
                    side1 -
                    side2 -
                    countSolid(
                      frontX + cornerU * uStepX + cornerV * vStepX,
                      frontY + cornerU * uStepY + cornerV * vStepY,
                      frontZ + cornerU * uStepZ + cornerV * vStepZ,
                    );
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
            while (v + quadHeight < vSize && checkIsRowKey(u + (v + quadHeight) * uSize, quadWidth, key)) quadHeight++;
            for (let clearV = v; clearV < v + quadHeight; clearV++)
              mask.fill(0, u + clearV * uSize, u + quadWidth + clearV * uSize);

            const vertexIndex = positions.length / 3;
            const rgb = rgbs[(key & 0xff) - 1] ?? [1, 1, 1];
            const shade = AXIS_SHADES[direction === 1 ? 0 : 1][axis] ?? 1;
            vertex[axis] = slice + (direction === 1 ? 1 : 0);
            for (const [cornerIndex, [cornerU, cornerV]] of CORNERS.entries()) {
              vertex[uAxis] = cornerU === -1 ? u : u + quadWidth;
              vertex[vAxis] = cornerV === -1 ? v : v + quadHeight;
              positions.push((vertex[0] ?? 0) - border, vertex[1] ?? 0, (vertex[2] ?? 0) - border);
              const light = shade * (AMBIENT_OCCLUSION_SHADES[(key >> (8 + cornerIndex * 2)) & 3] ?? 1);
              colors.push(rgb[0] * light, rgb[1] * light, rgb[2] * light);
            }
            // The corners wind counterclockwise seen from the side the face points to, reversed for the far side; the
            // Diagonal runs between the brighter pair so occlusion shades evenly across the quad
            const isFlipped = ((key >> 8) & 3) + ((key >> 12) & 3) <= ((key >> 10) & 3) + ((key >> 14) & 3);
            const quadIndices =
              direction === 1
                ? isFlipped
                  ? FLIPPED_QUAD_INDICES
                  : QUAD_INDICES
                : isFlipped
                  ? REVERSED_FLIPPED_QUAD_INDICES
                  : REVERSED_QUAD_INDICES;
            for (const corner of quadIndices) indices.push(vertexIndex + corner);
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
