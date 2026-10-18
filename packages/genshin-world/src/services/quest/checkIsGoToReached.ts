import type { GoToPlace } from "#src/models/world/GoToPlace";
import type { GroundPoint } from "genshin-engine";

// Whether a ground point stands within a go-to place's radius, measured across the ground
export const checkIsGoToReached = ({ position, radius }: GoToPlace, point: GroundPoint): boolean =>
  Math.hypot(point.x - position.x, point.z - position.z) <= radius;
