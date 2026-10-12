import type { GroundPoint } from "genshin-engine";

// Where the player stands over the ground in world metres, the yaw the view faces and the yaw the character faces, in
// Radians, as the map and the minimap draw them
export interface MapCamera extends GroundPoint {
  facing: number;
  yaw: number;
}
