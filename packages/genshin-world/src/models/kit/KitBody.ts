import type { GroundPoint } from "genshin-engine";

// The body a kit acts from as its attack areas and its targeting read it: its feet on the ground, its facing in the
// Controller's yaw, and its feet's height above the ground
export interface KitBody {
  facing: number;
  height: number;
  position: GroundPoint;
}
