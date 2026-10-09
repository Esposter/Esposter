import type { KitField } from "#src/models/kit/KitField";
import type { GroundPoint } from "genshin-engine";

// Whether a point stands within a field's circle, measured across the ground
export const checkIsInKitField = ({ centre, radius }: KitField, point: GroundPoint): boolean =>
  Math.hypot(point.x - centre.x, point.z - centre.z) <= radius;
