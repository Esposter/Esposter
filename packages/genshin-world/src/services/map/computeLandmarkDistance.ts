import type { Landmark } from "#src/models/world/Landmark";
import type { GroundPoint } from "genshin-engine";

// The distance in metres across the ground from a landmark to a point on it
export const computeLandmarkDistance = ({ position }: Landmark, point: GroundPoint): number =>
  Math.hypot(position.x - point.x, position.z - point.z);
