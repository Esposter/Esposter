import type { PaletteColor } from "@/models/agentConsole/PaletteColor";
import type { Vector3Tuple } from "three";
// A solid run of voxels of one colour, from its minimum corner to its maximum, both inclusive
export interface VoxelBox {
  color: PaletteColor;
  max: Vector3Tuple;
  min: Vector3Tuple;
}
