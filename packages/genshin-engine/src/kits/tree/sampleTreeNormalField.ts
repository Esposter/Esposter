import type { TreeNormalField } from "#src/models/kits/tree/TreeNormalField";

// The normal a field gives at a point, blended trilinearly from the cells around it and kept to the cells' edges, or
// Undefined where the blend is nothing
export const sampleTreeNormalField = (
  { cellSize, normals, origin, size }: TreeNormalField,
  position: [number, number, number],
): [number, number, number] | undefined => {
  const [sizeX = 1, sizeY = 1, sizeZ = 1] = size;
  const cellCoordinate = (axis: 0 | 1 | 2, cellCount: number): [number, number, number] => {
    const coordinate = Math.min(Math.max(((position[axis] ?? 0) - (origin[axis] ?? 0)) / cellSize, 0), cellCount - 1);
    const lower = Math.floor(coordinate);
    return [lower, Math.min(lower + 1, cellCount - 1), coordinate - lower];
  };
  const [x0, x1, fx] = cellCoordinate(0, sizeX);
  const [y0, y1, fy] = cellCoordinate(1, sizeY);
  const [z0, z1, fz] = cellCoordinate(2, sizeZ);
  const sum: [number, number, number] = [0, 0, 0];
  for (const [ix, wx] of [
    [x0, 1 - fx],
    [x1, fx],
  ] as const)
    for (const [iy, wy] of [
      [y0, 1 - fy],
      [y1, fy],
    ] as const)
      for (const [iz, wz] of [
        [z0, 1 - fz],
        [z1, fz],
      ] as const) {
        const weight = wx * wy * wz;
        const offset = ((ix * sizeY + iy) * sizeZ + iz) * 3;
        for (const axis of [0, 1, 2] as const) sum[axis] += weight * (normals[offset + axis] ?? 0);
      }
  const length = Math.hypot(...sum);
  return length === 0 ? undefined : [sum[0] / length, sum[1] / length, sum[2] / length];
};
