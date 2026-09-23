import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";

import { CHUNK_BORDER, CHUNK_GRID_SIZE, WORLD_HEIGHT } from "@/services/agentConsole/world/constants";
import { fillVoxelBox } from "@/services/agentConsole/world/fillVoxelBox";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
import { describe } from "vitest";
// A world of one generated chunk, the one at the origin, holding the boxes and nothing else
export const createVoxelWorld = (voxelBoxes: VoxelBox[]): VoxelWorld => {
  const voxelGrid = {
    depth: CHUNK_GRID_SIZE,
    height: WORLD_HEIGHT,
    voxels: new Uint8Array(CHUNK_GRID_SIZE * WORLD_HEIGHT * CHUNK_GRID_SIZE),
    width: CHUNK_GRID_SIZE,
  };
  for (const { color, max, min } of voxelBoxes)
    fillVoxelBox(voxelGrid, {
      color,
      max: [max[0] + CHUNK_BORDER, max[1], max[2] + CHUNK_BORDER],
      min: [min[0] + CHUNK_BORDER, min[1], min[2] + CHUNK_BORDER],
    });
  return new Map([[getChunkKey(0, 0), voxelGrid]]);
};

describe.todo("createVoxelWorld");
