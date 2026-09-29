import type { Heightfield } from "#src/terrain/Heightfield";
import type { HeightfieldOptions } from "#src/terrain/HeightfieldOptions";

// A square grid of heights as flat typed arrays, ready to hand to the GPU or across from a worker without a copy.
// Heights are sampled once each into a buffer, and every normal is read from its neighbours' heights by central
// Differences rather than from the triangles, so a tile's edge normal matches its neighbour's
export const computeHeightfield = ({ getHeight, resolution, size, writeColor }: HeightfieldOptions): Heightfield => {
  const vertexCount = resolution * resolution;
  const step = size / (resolution - 1);
  const half = size / 2;
  const heights = new Float32Array(vertexCount);
  for (let row = 0; row < resolution; row++)
    for (let column = 0; column < resolution; column++)
      heights[row * resolution + column] = getHeight(column * step - half, row * step - half);

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  for (let row = 0; row < resolution; row++)
    for (let column = 0; column < resolution; column++) {
      const index = row * resolution + column;
      const x = column * step - half;
      const z = row * step - half;
      const height = heights[index] ?? 0;
      const left = heights[row * resolution + Math.max(column - 1, 0)] ?? height;
      const right = heights[row * resolution + Math.min(column + 1, resolution - 1)] ?? height;
      const back = heights[Math.max(row - 1, 0) * resolution + column] ?? height;
      const front = heights[Math.min(row + 1, resolution - 1) * resolution + column] ?? height;
      const normalX = left - right;
      const normalY = 2 * step;
      const normalZ = back - front;
      const length = Math.hypot(normalX, normalY, normalZ);
      const offset = index * 3;
      positions[offset] = x;
      positions[offset + 1] = height;
      positions[offset + 2] = z;
      normals[offset] = normalX / length;
      normals[offset + 1] = normalY / length;
      normals[offset + 2] = normalZ / length;
      writeColor(colors, offset, height, 1 - normalY / length, x, z);
    }

  const cellsPerSide = resolution - 1;
  const indices = new Uint32Array(cellsPerSide * cellsPerSide * 6);
  let cursor = 0;
  for (let row = 0; row < cellsPerSide; row++)
    for (let column = 0; column < cellsPerSide; column++) {
      const topLeft = row * resolution + column;
      const bottomLeft = topLeft + resolution;
      indices[cursor++] = topLeft;
      indices[cursor++] = bottomLeft;
      indices[cursor++] = topLeft + 1;
      indices[cursor++] = topLeft + 1;
      indices[cursor++] = bottomLeft;
      indices[cursor++] = bottomLeft + 1;
    }

  return { colors, indices, normals, positions };
};
