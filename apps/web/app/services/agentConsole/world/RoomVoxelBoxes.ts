import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import {
  DOOR_HEIGHT,
  DOOR_MAX_Z,
  DOOR_MIN_Z,
  ROOM_DEPTH,
  ROOM_HEIGHT,
  ROOM_WIDTH,
} from "@/services/agentConsole/world/constants";
import { WorldObjectEntries } from "@/services/agentConsole/world/WorldObjectMap";
// The room as the voxel boxes it is built from, stamped into the world at spawn in this order: the floor, the wall
// Behind, the wall to the left around the door's opening, the door swung open outward against the wall beside it, and
// Every object. The two sides the camera looks in over stay open
export const RoomVoxelBoxes: VoxelBox[] = [
  { color: PaletteColor.Floor, max: [ROOM_WIDTH - 1, 0, ROOM_DEPTH - 1], min: [0, 0, 0] },
  { color: PaletteColor.Wall, max: [ROOM_WIDTH - 1, ROOM_HEIGHT - 1, 0], min: [0, 1, 0] },
  { color: PaletteColor.Wall, max: [0, ROOM_HEIGHT - 1, DOOR_MIN_Z - 1], min: [0, 1, 0] },
  { color: PaletteColor.Wall, max: [0, ROOM_HEIGHT - 1, DOOR_MAX_Z], min: [0, DOOR_HEIGHT + 1, DOOR_MIN_Z] },
  { color: PaletteColor.Wall, max: [0, ROOM_HEIGHT - 1, ROOM_DEPTH - 1], min: [0, 1, DOOR_MAX_Z + 1] },
  // The door, as wide as the opening, swung outward on a hinge at its far edge to stand straight out from the wall
  {
    color: PaletteColor.Wood,
    max: [-1, DOOR_HEIGHT, DOOR_MAX_Z + 1],
    min: [DOOR_MIN_Z - DOOR_MAX_Z - 1, 1, DOOR_MAX_Z + 1],
  },
  ...WorldObjectEntries.flatMap(([, { boxes }]) => boxes),
];
