import type { Vector3Tuple } from "three";

import { WorldObjectEntries } from "@/services/agentConsole/world/WorldObjectMap";
// The object a voxel of the room belongs to, if any — how a click on the room's one mesh is told apart by where it
// Landed rather than by a mesh per object
export const getWorldObjectType = ([x, y, z]: Vector3Tuple) =>
  WorldObjectEntries.find(([, { boxes }]) =>
    boxes.some(
      ({ max, min }) => x >= min[0] && x <= max[0] && y >= min[1] && y <= max[1] && z >= min[2] && z <= max[2],
    ),
  )?.[0];
