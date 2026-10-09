import type { NormalField } from "#src/models/genshinAssets/fit/NormalField";
import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A point's normal, sampled where its own cell stands: a cell the points fall in averages their normals, each cell
// Nothing falls in takes the normal of its nearest filled cell through the grid (a breadth-first flood), and every
// Normal is kept to the decimals a fit keeps
export const computeNormalField = (
  samples: readonly { normal: Vector; position: Vector }[],
  cellSize: number,
): NormalField => {
  if (samples.length === 0) throw new InvalidOperationError(Operation.Read, "normal field", "has no samples");
  const origin = [0, 1, 2].map((axis) => Math.min(...samples.map(({ position }) => position[axis] ?? 0))) as Vector;
  const maximum = [0, 1, 2].map((axis) => Math.max(...samples.map(({ position }) => position[axis] ?? 0))) as Vector;
  const size = [0, 1, 2].map(
    (axis) => Math.floor(((maximum[axis] ?? 0) - (origin[axis] ?? 0)) / cellSize) + 1,
  ) as Vector;
  const [sizeX, sizeY, sizeZ] = size;
  const cellIndex = (ix: number, iy: number, iz: number): number => (ix * sizeY + iy) * sizeZ + iz;
  const cellCount = sizeX * sizeY * sizeZ;
  const sums = new Float64Array(cellCount * 3);
  const counts = new Uint32Array(cellCount);
  for (const { normal, position } of samples) {
    const [ix, iy, iz] = [0, 1, 2].map((axis) =>
      Math.min((size[axis] ?? 1) - 1, Math.floor(((position[axis] ?? 0) - (origin[axis] ?? 0)) / cellSize)),
    );
    const index = cellIndex(ix, iy, iz);
    counts[index]++;
    for (const axis of [0, 1, 2] as const) sums[index * 3 + axis] = (sums[index * 3 + axis] ?? 0) + (normal[axis] ?? 0);
  }
  const normals = new Float64Array(cellCount * 3);
  const visited = new Uint8Array(cellCount);
  const queue: number[] = [];
  for (const index of counts.keys()) {
    const count = counts[index] ?? 0;
    if (count === 0) continue;
    const [x = 0, y = 0, z = 0] = [0, 1, 2].map((axis) => (sums[index * 3 + axis] ?? 0) / count);
    const length = Math.hypot(x, y, z) || 1;
    normals.set([x / length, y / length, z / length], index * 3);
    visited[index] = 1;
    queue.push(index);
  }
  if (queue.length === 0) throw new InvalidOperationError(Operation.Read, "normal field", "has no sample in any cell");
  // Each cell's neighbours one step along each axis, in the order the flood takes them
  const neighbourOffsets = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ] as const;
  // The queue grows as the flood reaches further, which an array iterator follows
  for (const current of queue) {
    const iz = current % sizeZ;
    const iy = Math.floor(current / sizeZ) % sizeY;
    const ix = Math.floor(current / (sizeY * sizeZ));
    for (const [dx, dy, dz] of neighbourOffsets) {
      const [nx, ny, nz] = [ix + dx, iy + dy, iz + dz];
      if (nx < 0 || ny < 0 || nz < 0 || nx >= sizeX || ny >= sizeY || nz >= sizeZ) continue;
      const neighbour = cellIndex(nx, ny, nz);
      if (visited[neighbour]) continue;
      visited[neighbour] = 1;
      normals.set(normals.subarray(current * 3, current * 3 + 3), neighbour * 3);
      queue.push(neighbour);
    }
  }
  return {
    cellSize,
    normals: Array.from(normals, (value) => roundFitted(value)),
    origin: origin.map((value) => roundFitted(value)) as NormalField["origin"],
    size,
  };
};
