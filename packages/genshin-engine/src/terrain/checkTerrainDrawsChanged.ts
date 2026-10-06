import type { TerrainOptions } from "#src/models/terrain/TerrainOptions";
import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";
import type { Vector3Like } from "three";

import { getTerrainTileColumn } from "#src/terrain/getTerrainTileColumn";
import { getTerrainTileLevel } from "#src/terrain/getTerrainTileLevel";
import { getTerrainTileRow } from "#src/terrain/getTerrainTileRow";

// Reused every call, so a check allocates nothing once it has grown to the draws
const otherKeys = new Set<number>();

const checkAddedWithin = (
  finestTileSize: number,
  selection: TerrainSelection,
  other: TerrainSelection,
  center: Vector3Like,
  halfSize: number,
): boolean => {
  otherKeys.clear();
  for (let index = 0; index < other.count; index++) otherKeys.add(other.keys[index] ?? 0);
  for (let index = 0; index < selection.count; index++) {
    const key = selection.keys[index] ?? 0;
    if (otherKeys.has(key)) continue;
    const size = finestTileSize * 2 ** getTerrainTileLevel(key);
    const left = getTerrainTileColumn(key) * size;
    const back = getTerrainTileRow(key) * size;
    if (
      left < center.x + halfSize &&
      left + size > center.x - halfSize &&
      back < center.z + halfSize &&
      back + size > center.z - halfSize
    )
      return true;
  }
  return false;
};
// Whether the ground drawn over a square, centred on a world position, differs between two frames' draws: a tile
// Drawn in one and not the other that overlaps the square. Draws resolved from the same tiles come out in the same
// Order, so the frame nothing changed is told by one pass with no lookups
export const checkTerrainDrawsChanged = (
  { finestTileSize }: Pick<TerrainOptions, "finestTileSize">,
  previous: TerrainSelection,
  next: TerrainSelection,
  center: Vector3Like,
  halfSize: number,
): boolean => {
  if (previous.count === next.count) {
    let index = 0;
    while (index < next.count && previous.keys[index] === next.keys[index]) index++;
    if (index === next.count) return false;
  }

  return (
    checkAddedWithin(finestTileSize, next, previous, center, halfSize) ||
    checkAddedWithin(finestTileSize, previous, next, center, halfSize)
  );
};
