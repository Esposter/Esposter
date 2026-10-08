import type { GroundPoint } from "genshin-engine";

// Where the camera stands over the ground in world metres and the yaw it faces in radians, as the map and the minimap
// Draw it
export interface MapCamera extends GroundPoint {
  yaw: number;
}
