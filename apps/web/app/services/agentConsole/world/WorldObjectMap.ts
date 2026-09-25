import type { WorldObject } from "@/models/agentConsole/world/WorldObject";

import { PaletteColor } from "@/models/agentConsole/PaletteColor";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
// Every object in the room as the voxel boxes it is built from, painted over the floor and walls in this order
export const WorldObjectMap = {
  [WorldObjectType.Desk]: {
    boxes: [{ color: PaletteColor.Wood, max: [11, 1, 10], min: [10, 1, 9] }],
    standPosition: [12.5, 1, 10],
  },
  [WorldObjectType.Gate]: {
    boxes: [
      { color: PaletteColor.Stone, max: [4, 3, 11], min: [4, 1, 11] },
      { color: PaletteColor.Stone, max: [6, 3, 11], min: [6, 1, 11] },
      { color: PaletteColor.Stone, max: [6, 4, 11], min: [4, 4, 11] },
    ],
    standPosition: [5.5, 1, 10],
  },
  [WorldObjectType.Library]: {
    boxes: [
      { color: PaletteColor.Wood, max: [9, 4, 1], min: [7, 1, 1] },
      { color: PaletteColor.Book, max: [9, 3, 1], min: [7, 2, 1] },
    ],
    standPosition: [8.5, 1, 3],
  },
  [WorldObjectType.Portal]: {
    boxes: [{ color: PaletteColor.Portal, max: [9, 0, 10], min: [7, 0, 8] }],
    standPosition: [8.5, 1, 9.5],
  },
  [WorldObjectType.Telescope]: {
    boxes: [
      { color: PaletteColor.Stone, max: [3, 2, 6], min: [3, 1, 6] },
      { color: PaletteColor.Accent, max: [4, 3, 6], min: [3, 3, 6] },
    ],
    standPosition: [4.5, 1, 7.5],
  },
  [WorldObjectType.Terminal]: {
    boxes: [
      { color: PaletteColor.Stone, max: [14, 2, 8], min: [14, 1, 7] },
      { color: PaletteColor.Screen, max: [14, 2, 8], min: [14, 2, 7] },
    ],
    standPosition: [13, 1, 8],
  },
  [WorldObjectType.Workbench]: {
    boxes: [{ color: PaletteColor.Wood, max: [13, 1, 4], min: [11, 1, 3] }],
    standPosition: [12.5, 1, 5.5],
  },
} satisfies Record<WorldObjectType, WorldObject>;
