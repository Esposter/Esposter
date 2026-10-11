import type { GroundPoint } from "genshin-engine";

import { getOrCreate, InvalidOperationError, Operation } from "@esposter/shared";

// The cells each area holds of the tiles its points stand on: every tile any area's point stands on, cut into cells of
// `cellSize`, each cell the area of the point nearest its centre, so two areas' points on one tile split it between
// Them and no cell is two areas'. Points stand in a frame whose tiles start at its zero, and a cell is its index on a
// Grid of `width` columns from `corner`, the least tile's least corner
export const computeAreaCells = <TArea>(
  points: readonly (GroundPoint & { area: TArea })[],
  { cellSize, tileSize }: { cellSize: number; tileSize: number },
): { areaCellsMap: Map<TArea, number[]>; corner: [number, number]; width: number } => {
  const cellsPerTile = tileSize / cellSize;
  if (!Number.isInteger(cellsPerTile))
    throw new InvalidOperationError(Operation.Read, String(cellSize), `does not divide a tile of ${tileSize}`);
  const tileMap = new Map<string, [number, number]>();
  for (const { x, z } of points) {
    const tile: [number, number] = [Math.floor(x / tileSize), Math.floor(z / tileSize)];
    tileMap.set(tile.join(","), tile);
  }
  const tiles = [...tileMap.values()];
  const firstColumn = Math.min(...tiles.map(([column]) => column));
  const firstRow = Math.min(...tiles.map(([, row]) => row));
  const width = (Math.max(...tiles.map(([column]) => column)) - firstColumn + 1) * cellsPerTile;
  const corner: [number, number] = [firstColumn * tileSize, firstRow * tileSize];
  const areaCellsMap = new Map<TArea, number[]>();
  for (const [tileColumn, tileRow] of tiles)
    for (let cellRow = 0; cellRow < cellsPerTile; cellRow++)
      for (let cellColumn = 0; cellColumn < cellsPerTile; cellColumn++) {
        const column = (tileColumn - firstColumn) * cellsPerTile + cellColumn;
        const row = (tileRow - firstRow) * cellsPerTile + cellRow;
        const x = corner[0] + (column + 0.5) * cellSize;
        const z = corner[1] + (row + 0.5) * cellSize;
        let nearest: (typeof points)[number] | undefined;
        let nearestDistance = Infinity;
        for (const point of points) {
          const distance = (point.x - x) ** 2 + (point.z - z) ** 2;
          if (distance >= nearestDistance) continue;
          nearest = point;
          nearestDistance = distance;
        }
        if (!nearest) continue;
        getOrCreate(areaCellsMap, nearest.area, () => []).push(row * width + column);
      }
  return { areaCellsMap, corner, width };
};
