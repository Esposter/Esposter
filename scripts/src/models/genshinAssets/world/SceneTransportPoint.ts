import type { GroundPoint } from "genshin-engine";

// A transport point of the scene, the kind a statue and a waypoint share: the area it stands in by the area table's ID,
// If the dump names one, its key in the dump's category, its place in the game's axes, its height, the point's `y`, and
// The turn its arrival faces about the vertical in degrees
export interface SceneTransportPoint {
  area?: number;
  height: number;
  id: string;
  position: GroundPoint;
  turnDegrees: number;
}
