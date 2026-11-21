import type { TreeNormalField } from "#src/models/kits/tree/TreeNormalField";

// A point's coordinate along one axis in cells, held between the first cell's centre and the last cell's centre
const readCellCoordinate = (position: number, origin: number, cellSize: number, cellCount: number): number =>
  Math.min(Math.max((position - origin) / cellSize - 0.5, 0), cellCount - 1);

// Writes the normal a field gives at a point into the target from the offset, blended trilinearly from the cells
// Around it and kept to the cells' edges, and returns whether it wrote one: where the blend is nothing it writes
// Nothing. A cell's normal is the mean of the points its span holds, so it stands at the cell's centre, half a cell
// On from its corner
export const writeTreeNormalField = (
  target: Float64Array,
  offset: number,
  { cellSize, normals, origin, size }: TreeNormalField,
  x: number,
  y: number,
  z: number,
): boolean => {
  const sizeX = size[0] ?? 1;
  const sizeY = size[1] ?? 1;
  const sizeZ = size[2] ?? 1;
  const coordinateX = readCellCoordinate(x, origin[0] ?? 0, cellSize, sizeX);
  const coordinateY = readCellCoordinate(y, origin[1] ?? 0, cellSize, sizeY);
  const coordinateZ = readCellCoordinate(z, origin[2] ?? 0, cellSize, sizeZ);
  const x0 = Math.floor(coordinateX);
  const y0 = Math.floor(coordinateY);
  const z0 = Math.floor(coordinateZ);
  const x1 = Math.min(x0 + 1, sizeX - 1);
  const y1 = Math.min(y0 + 1, sizeY - 1);
  const z1 = Math.min(z0 + 1, sizeZ - 1);
  const fx = coordinateX - x0;
  const fy = coordinateY - y0;
  const fz = coordinateZ - z0;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  for (let upperX = 0; upperX < 2; upperX++) {
    const ix = upperX ? x1 : x0;
    const wx = upperX ? fx : 1 - fx;
    for (let upperY = 0; upperY < 2; upperY++) {
      const iy = upperY ? y1 : y0;
      const wy = upperY ? fy : 1 - fy;
      for (let upperZ = 0; upperZ < 2; upperZ++) {
        const iz = upperZ ? z1 : z0;
        const wz = upperZ ? fz : 1 - fz;
        const weight = wx * wy * wz;
        const index = ((ix * sizeY + iy) * sizeZ + iz) * 3;
        sumX += weight * (normals[index] ?? 0);
        sumY += weight * (normals[index + 1] ?? 0);
        sumZ += weight * (normals[index + 2] ?? 0);
      }
    }
  }
  const length = Math.hypot(sumX, sumY, sumZ);
  if (length === 0) return false;
  target[offset] = sumX / length;
  target[offset + 1] = sumY / length;
  target[offset + 2] = sumZ / length;
  return true;
};
