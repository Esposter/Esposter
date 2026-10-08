import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";

import { TERRAIN_CELL_SIZE } from "#src/terrain/constants";

const NO_ITEMS: never[] = [];

const toCellKey = (column: number, row: number): string => `${column},${row}`;
// Files each item under every cell its bounds cover, and returns the items filed under the cell a point stands in, so
// A point reads one cell's list rather than every item
export const fileByCell = <T>(
  items: readonly T[],
  getBounds: (item: T) => TerrainBounds,
): ((x: number, z: number) => readonly T[]) => {
  const cellItemsMap = new Map<string, T[]>();
  for (const item of items) {
    const { maxX, maxZ, minX, minZ } = getBounds(item);
    for (let column = Math.floor(minX / TERRAIN_CELL_SIZE); column <= Math.floor(maxX / TERRAIN_CELL_SIZE); column++)
      for (let row = Math.floor(minZ / TERRAIN_CELL_SIZE); row <= Math.floor(maxZ / TERRAIN_CELL_SIZE); row++) {
        const key = toCellKey(column, row);
        const cellItems = cellItemsMap.get(key);
        if (cellItems) cellItems.push(item);
        else cellItemsMap.set(key, [item]);
      }
  }
  return (x, z) =>
    cellItemsMap.get(toCellKey(Math.floor(x / TERRAIN_CELL_SIZE), Math.floor(z / TERRAIN_CELL_SIZE))) ?? NO_ITEMS;
};
