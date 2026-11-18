import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { GroundPoint } from "genshin-engine";

import { getSightRadius } from "#src/services/elementalSight/getSightRadius";
import { computeGroundDistanceSquared } from "genshin-engine";

// Whether a ground point lies within the sight's range, the circle it has spread to about where it was turned on
export const checkIsInSightReach = (sight: ElementalSight, point: GroundPoint): boolean =>
  computeGroundDistanceSquared(point, sight.origin) <= getSightRadius(sight) ** 2;
