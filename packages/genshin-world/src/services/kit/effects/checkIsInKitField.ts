import type { KitField } from "#src/models/kit/KitField";
import type { GroundPoint } from "genshin-engine";

// Whether a point stands within a field's circle, measured across the ground, or any circle of a centre and a radius
export const checkIsInKitField = (
  { centre, radius }: Pick<KitField, "centre" | "radius">,
  point: GroundPoint,
): boolean => Math.hypot(point.x - centre.x, point.z - centre.z) <= radius;
