import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH } from "@/services/agentConsole/world/constants";
import { fillVoxelBox } from "@/services/agentConsole/world/fillVoxelBox";
import { WorldObjectEntries } from "@/services/agentConsole/world/WorldObjectMap";

export const createRoomGrid = (): VoxelGrid => {
  const roomGrid = {
    depth: ROOM_DEPTH,
    height: ROOM_HEIGHT,
    voxels: new Uint8Array(ROOM_WIDTH * ROOM_HEIGHT * ROOM_DEPTH),
    width: ROOM_WIDTH,
  };
  fillVoxelBox(roomGrid, { color: PaletteColor.Floor, max: [ROOM_WIDTH - 1, 0, ROOM_DEPTH - 1], min: [0, 0, 0] });
  fillVoxelBox(roomGrid, { color: PaletteColor.Wall, max: [ROOM_WIDTH - 1, ROOM_HEIGHT - 1, 0], min: [0, 1, 0] });
  fillVoxelBox(roomGrid, { color: PaletteColor.Wall, max: [0, ROOM_HEIGHT - 1, ROOM_DEPTH - 1], min: [0, 1, 0] });
  for (const [, { boxes }] of WorldObjectEntries) for (const box of boxes) fillVoxelBox(roomGrid, box);
  return roomGrid;
};
