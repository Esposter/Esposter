import type { TerrainOptions } from "#src/terrain/TerrainOptions";
import type { TerrainSelection } from "#src/terrain/TerrainSelection";
import type { Frustum, Vector3Like } from "three";

import { getTerrainTileKey } from "#src/terrain/getTerrainTileKey";
import { Box3 } from "three";

const tileBox = new Box3();

const addKey = (selection: TerrainSelection, key: number): void => {
  if (selection.count === selection.keys.length) return;
  selection.keys[selection.count] = key;
  selection.count++;
};
// A tile is drawn at its own level when it is in its level's range and too far for the level below; nearer, its
// Four children are tried instead, and a child out of even its own range is still drawn at its level, fully morphed
// Onto this one's grid. A tile out of its range returns false, so its parent covers it. One outside the frustum
// Counts as covered and is skipped
const selectTile = (
  terrainOptions: TerrainOptions,
  eye: Vector3Like,
  frustum: Frustum | undefined,
  selection: TerrainSelection,
  level: number,
  column: number,
  row: number,
): boolean => {
  const { finestRange, finestTileSize, maxHeight, minHeight } = terrainOptions;
  const size = finestTileSize * 2 ** level;
  const left = column * size;
  const back = row * size;
  const distanceX = Math.max(left - eye.x, 0, eye.x - left - size);
  const distanceY = Math.max(minHeight - eye.y, 0, eye.y - maxHeight);
  const distanceZ = Math.max(back - eye.z, 0, eye.z - back - size);
  const distance = Math.hypot(distanceX, distanceY, distanceZ);
  const range = finestRange * 2 ** level;
  if (distance > range) return false;
  if (frustum) {
    tileBox.min.set(left, minHeight, back);
    tileBox.max.set(left + size, maxHeight, back + size);
    if (!frustum.intersectsBox(tileBox)) return true;
  }

  if (level === 0 || distance > range / 2) {
    addKey(selection, getTerrainTileKey(level, column, row));
    return true;
  }

  for (let childRow = row * 2; childRow < row * 2 + 2; childRow++)
    for (let childColumn = column * 2; childColumn < column * 2 + 2; childColumn++)
      if (!selectTile(terrainOptions, eye, frustum, selection, level - 1, childColumn, childRow))
        addKey(selection, getTerrainTileKey(level - 1, childColumn, childRow));

  return true;
};
// CDLOD's quadtree walked from the coarsest tiles around the eye down to the finest under it, by true
// Three-dimensional distance to each tile's bounds, so detail follows the camera's height as well as its position.
// Nothing bounds the world: the coarsest level is tiled out to its range in every direction. The eye and the frustum
// Are in world coordinates, and the keys are written into the selection, so a frame allocates nothing
export const selectTerrainTiles = (
  terrainOptions: TerrainOptions,
  eye: Vector3Like,
  frustum: Frustum | undefined,
  selection: TerrainSelection,
): TerrainSelection => {
  const { finestRange, finestTileSize, levelCount } = terrainOptions;
  const level = levelCount - 1;
  const size = finestTileSize * 2 ** level;
  const range = finestRange * 2 ** level;
  selection.count = 0;
  for (let row = Math.floor((eye.z - range) / size); row <= Math.floor((eye.z + range) / size); row++)
    for (let column = Math.floor((eye.x - range) / size); column <= Math.floor((eye.x + range) / size); column++)
      selectTile(terrainOptions, eye, frustum, selection, level, column, row);
  return selection;
};
