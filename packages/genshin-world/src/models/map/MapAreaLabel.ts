import type { GroundPoint } from "genshin-engine";

// An area's name as the map writes it, at a point in world metres
export interface MapAreaLabel extends GroundPoint {
  id: string;
  name: string;
}
