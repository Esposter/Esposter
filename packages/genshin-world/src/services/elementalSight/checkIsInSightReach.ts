import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { GroundPoint } from "genshin-engine";

import { getSightRadius } from "#src/services/elementalSight/getSightRadius";

// Whether a ground point lies within the sight's range, the circle it has spread to about where it was turned on
export const checkIsInSightReach = (sight: ElementalSight, { x, z }: GroundPoint): boolean =>
  (x - sight.origin.x) ** 2 + (z - sight.origin.z) ** 2 <= getSightRadius(sight) ** 2;
