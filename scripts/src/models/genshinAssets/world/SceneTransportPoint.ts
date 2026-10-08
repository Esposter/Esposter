import type { GroundPoint } from "genshin-engine";

// A transport point of the scene, the kind a statue and a waypoint share: the area it stands in by the area table's ID,
// If the dump names one, its place in the game's axes and its height, the point's `_y`
export interface SceneTransportPoint {
  area?: number;
  height: number;
  position: GroundPoint;
}
