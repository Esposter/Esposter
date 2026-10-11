import type { TerrainBounds } from "#src/models/terrain/TerrainBounds";
import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { TERRAIN_CELL_SIZE } from "#src/terrain/constants";
import { getTerrainFeatureBounds } from "#src/terrain/getTerrainFeatureBounds";
import { getTerrainShapeLevel } from "#src/terrain/getTerrainShapeLevel";

// The rectangle past which a ground laid over another (`createTerrainShapeHeight`) changes no height: round its
// Features, its level, whose reach holds every one of its hills', and its residual's fade, grown out to the cells they
// Are filed in, since a point reads every item filed under its own cell however far past the item's reach it stands. A
// Residual with no fade is drawn everywhere, so it reaches everywhere, and a ground with nothing laid reaches nowhere
export const getTerrainOverlayBounds = (shape: TerrainShape): TerrainBounds => {
  const { features = [], residual } = shape;
  if (residual && !residual.fade) return { maxX: Infinity, maxZ: Infinity, minX: -Infinity, minZ: -Infinity };
  // A level's reach is the same over any base, only its height is not
  const level = getTerrainShapeLevel(shape, shape.base);
  const reaches = [...features, ...(level ? [level] : [])].map((feature) => getTerrainFeatureBounds(feature));
  if (residual?.fade) {
    const { cellSize, origin, size } = residual.fade;
    const fadeX = origin[0] ?? 0;
    const fadeZ = origin[1] ?? 0;
    reaches.push({
      maxX: fadeX + ((size[0] ?? 1) - 1) * cellSize,
      maxZ: fadeZ + ((size[1] ?? 1) - 1) * cellSize,
      minX: fadeX,
      minZ: fadeZ,
    });
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const reach of reaches) {
    minX = Math.min(minX, reach.minX);
    maxX = Math.max(maxX, reach.maxX);
    minZ = Math.min(minZ, reach.minZ);
    maxZ = Math.max(maxZ, reach.maxZ);
  }
  return {
    maxX: (Math.floor(maxX / TERRAIN_CELL_SIZE) + 1) * TERRAIN_CELL_SIZE,
    maxZ: (Math.floor(maxZ / TERRAIN_CELL_SIZE) + 1) * TERRAIN_CELL_SIZE,
    minX: Math.floor(minX / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE,
    minZ: Math.floor(minZ / TERRAIN_CELL_SIZE) * TERRAIN_CELL_SIZE,
  };
};
