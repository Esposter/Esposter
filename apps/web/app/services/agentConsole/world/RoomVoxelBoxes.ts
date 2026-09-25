import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { WorldObject } from "@/models/agentConsole/world/WorldObject";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import {
  DOOR_HEIGHT,
  DOOR_MAX_Z,
  DOOR_MIN_Z,
  ROOM_DEPTH,
  ROOM_HEIGHT,
  ROOM_WIDTH,
} from "@/services/agentConsole/world/constants";
import { WorldObjectMap } from "@/services/agentConsole/world/WorldObjectMap";
// The room's far edges and its top course, in voxels
const LAST_X = ROOM_WIDTH - 1;
const LAST_Y = ROOM_HEIGHT - 1;
const LAST_Z = ROOM_DEPTH - 1;
// A timber post from the floor to the beam, standing in a wall
const createPost = (x: number, z: number): VoxelBox => ({
  color: PaletteColor.Wood,
  max: [x, LAST_Y, z],
  min: [x, 1, z],
});
// A torch on a wall: a stick with its flame above it, over a standing player's head
const createTorch = (x: number, z: number): VoxelBox[] => [
  { color: PaletteColor.Wood, max: [x, 3, z], min: [x, 3, z] },
  { color: PaletteColor.Torch, max: [x, 4, z], min: [x, 4, z] },
];
// A plant in a pot
const createPlant = (x: number, z: number): VoxelBox[] => [
  { color: PaletteColor.Dirt, max: [x, 1, z], min: [x, 1, z] },
  { color: PaletteColor.Grass, max: [x, 2, z], min: [x, 2, z] },
];
// The room as the voxel boxes it is built from, stamped into the world at spawn in this order, each over the last. The
// Floor has a plank border and a rug; the four walls are plaster over a stone course, framed by timber posts and a beam
// Along the top, with the door's frame in the left wall and a window in the wall behind and the wall to the right; and
// Torches, a notice board, a bed and plants furnish it around every object. The door is stamped beside them in
// Whichever state it is in
export const RoomVoxelBoxes: VoxelBox[] = [
  { color: PaletteColor.Floor, max: [LAST_X, 0, LAST_Z], min: [0, 0, 0] },
  { color: PaletteColor.Wood, max: [LAST_X - 1, 0, 1], min: [1, 0, 1] },
  { color: PaletteColor.Wood, max: [LAST_X - 1, 0, LAST_Z - 1], min: [1, 0, LAST_Z - 1] },
  { color: PaletteColor.Wood, max: [1, 0, LAST_Z - 1], min: [1, 0, 1] },
  { color: PaletteColor.Wood, max: [LAST_X - 1, 0, LAST_Z - 1], min: [LAST_X - 1, 0, 1] },
  { color: PaletteColor.Rug, max: [10, 0, 7], min: [5, 0, 4] },
  // The wall behind, around a window two voxels square
  { color: PaletteColor.Wall, max: [10, LAST_Y, 0], min: [0, 1, 0] },
  { color: PaletteColor.Wall, max: [LAST_X, LAST_Y, 0], min: [13, 1, 0] },
  { color: PaletteColor.Wall, max: [12, 2, 0], min: [11, 1, 0] },
  { color: PaletteColor.Wall, max: [12, LAST_Y, 0], min: [11, 5, 0] },
  // The wall to the left, around the door's opening
  { color: PaletteColor.Wall, max: [0, LAST_Y, DOOR_MIN_Z - 1], min: [0, 1, 0] },
  { color: PaletteColor.Wall, max: [0, LAST_Y, DOOR_MAX_Z], min: [0, DOOR_HEIGHT + 1, DOOR_MIN_Z] },
  { color: PaletteColor.Wall, max: [0, LAST_Y, LAST_Z], min: [0, 1, DOOR_MAX_Z + 1] },
  // The wall to the right, around a window two voxels square
  { color: PaletteColor.Wall, max: [LAST_X, LAST_Y, 4], min: [LAST_X, 1, 0] },
  { color: PaletteColor.Wall, max: [LAST_X, LAST_Y, LAST_Z], min: [LAST_X, 1, 7] },
  { color: PaletteColor.Wall, max: [LAST_X, 2, 6], min: [LAST_X, 1, 5] },
  { color: PaletteColor.Wall, max: [LAST_X, LAST_Y, 6], min: [LAST_X, 5, 5] },
  // The wall in front
  { color: PaletteColor.Wall, max: [LAST_X, LAST_Y, LAST_Z], min: [0, 1, LAST_Z] },
  // A stone course along the foot of every wall, the door's opening left clear, and a beam along the top of every wall
  { color: PaletteColor.Stone, max: [LAST_X, 1, 0], min: [0, 1, 0] },
  { color: PaletteColor.Stone, max: [LAST_X, 1, LAST_Z], min: [0, 1, LAST_Z] },
  { color: PaletteColor.Stone, max: [0, 1, DOOR_MIN_Z - 1], min: [0, 1, 0] },
  { color: PaletteColor.Stone, max: [0, 1, LAST_Z], min: [0, 1, DOOR_MAX_Z + 1] },
  { color: PaletteColor.Stone, max: [LAST_X, 1, LAST_Z], min: [LAST_X, 1, 0] },
  { color: PaletteColor.Wood, max: [LAST_X, LAST_Y, 0], min: [0, LAST_Y, 0] },
  { color: PaletteColor.Wood, max: [LAST_X, LAST_Y, LAST_Z], min: [0, LAST_Y, LAST_Z] },
  { color: PaletteColor.Wood, max: [0, LAST_Y, LAST_Z], min: [0, LAST_Y, 0] },
  { color: PaletteColor.Wood, max: [LAST_X, LAST_Y, LAST_Z], min: [LAST_X, LAST_Y, 0] },
  // The posts: the room's corners, between the windows and the things along the walls, and the door's frame with its
  // Lintel
  ...[0, 6, 10, LAST_X].flatMap((x) => [createPost(x, 0), createPost(x, LAST_Z)]),
  ...[4, 8].map((z) => createPost(LAST_X, z)),
  ...[4, DOOR_MIN_Z - 1, DOOR_MAX_Z + 1].map((z) => createPost(0, z)),
  { color: PaletteColor.Wood, max: [0, DOOR_HEIGHT + 1, DOOR_MAX_Z], min: [0, DOOR_HEIGHT + 1, DOOR_MIN_Z] },
  // Torches on the post behind, the wall to the left, the wall to the right over the bed, and the wall in front
  ...createTorch(6, 1),
  ...createTorch(1, 2),
  ...createTorch(LAST_X - 1, 10),
  ...createTorch(9, LAST_Z - 1),
  // A bed in the front corner on the right, its blanket towards the room and its pillow against the wall
  { color: PaletteColor.Rug, max: [LAST_X - 1, 1, 10], min: [LAST_X - 2, 1, 10] },
  { color: PaletteColor.Text, max: [LAST_X - 1, 1, LAST_Z - 1], min: [LAST_X - 2, 1, LAST_Z - 1] },
  // A notice board on the wall behind, its pinned note pale on the wood
  { color: PaletteColor.Wood, max: [5, 5, 1], min: [2, 3, 1] },
  { color: PaletteColor.Text, max: [4, 4, 1], min: [3, 4, 1] },
  // Plants in the back corner on the right and the front corner on the left
  ...createPlant(LAST_X - 1, 1),
  ...createPlant(1, LAST_Z - 1),
  ...Object.values<WorldObject>(WorldObjectMap).flatMap(({ boxes }) => boxes),
];
