import type { ChunkRequest } from "@/models/agentConsole/world/ChunkRequest";
import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColor, PaletteColors } from "@/models/agentConsole/PaletteColor";
import {
  CHUNK_BORDER,
  CHUNK_GRID_SIZE,
  CHUNK_SIZE,
  DIRT_DEPTH,
  DOOR_CLOSED_BOX,
  DOOR_OPEN_BOX,
  WORLD_HEIGHT,
} from "@/services/agentConsole/world/constants";
import { fillVoxelBox } from "@/services/agentConsole/world/fillVoxelBox";
import { getTerrainHeight } from "@/services/agentConsole/world/getTerrainHeight";
import { RoomVoxelBoxes } from "@/services/agentConsole/world/RoomVoxelBoxes";

const GRASS_VOXEL = PaletteColors.indexOf(PaletteColor.Grass) + 1;
const DIRT_VOXEL = PaletteColors.indexOf(PaletteColor.Dirt) + 1;
const STONE_VOXEL = PaletteColors.indexOf(PaletteColor.Stone) + 1;
// A chunk's voxels from its position alone, so the same chunk is the same on every load: each column's ground to the
// Noise's height, grass over a few voxels of dirt over stone, with the room stamped over whatever share of it falls in
// This chunk, its door open or closed. The grid holds the chunk's border of its neighbours' voxels too, generated the
// Same way
export const generateChunk = ({ chunkX, chunkZ, isDoorOpen }: ChunkRequest): VoxelGrid => {
  const voxelGrid = {
    depth: CHUNK_GRID_SIZE,
    height: WORLD_HEIGHT,
    voxels: new Uint8Array(CHUNK_GRID_SIZE * WORLD_HEIGHT * CHUNK_GRID_SIZE),
    width: CHUNK_GRID_SIZE,
  };
  const originX = chunkX * CHUNK_SIZE - CHUNK_BORDER;
  const originZ = chunkZ * CHUNK_SIZE - CHUNK_BORDER;

  for (let z = 0; z < CHUNK_GRID_SIZE; z++)
    for (let x = 0; x < CHUNK_GRID_SIZE; x++) {
      const terrainHeight = getTerrainHeight(originX + x, originZ + z);
      for (let y = 0; y < terrainHeight; y++)
        voxelGrid.voxels[x + CHUNK_GRID_SIZE * (y + WORLD_HEIGHT * z)] =
          y === terrainHeight - 1 ? GRASS_VOXEL : y >= terrainHeight - 1 - DIRT_DEPTH ? DIRT_VOXEL : STONE_VOXEL;
    }

  for (const { color, max, min } of [...RoomVoxelBoxes, isDoorOpen ? DOOR_OPEN_BOX : DOOR_CLOSED_BOX])
    fillVoxelBox(voxelGrid, {
      color,
      max: [max[0] - originX, max[1], max[2] - originZ],
      min: [min[0] - originX, min[1], min[2] - originZ],
    });
  return voxelGrid;
};
