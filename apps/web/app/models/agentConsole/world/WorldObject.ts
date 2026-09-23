import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { Vector3Tuple } from "three";

export interface WorldObject {
  boxes: VoxelBox[];
  // What its key does, named on the prompt a player standing at it sees
  promptTitle: string;
  // Where a figure stands to use it, on the floor in front of it
  standPosition: Vector3Tuple;
}
