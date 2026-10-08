import type { GroundPoint } from "genshin-engine";

// Where the player stands over the ground in world metres, and the yaw the view faces in radians, as the map and the
// Minimap draw them
export interface MapCamera extends GroundPoint {
  yaw: number;
}
