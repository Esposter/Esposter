import type { GroundPoint } from "genshin-engine";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { computeOutlineDistance } from "genshin-engine";

// The id of the catalogue area whose outline is nearest a place in its region, the one holding it where any does: a
// Waypoint past every outline, as one below the ground's caves is, is named by the area it stands nearest
export const findAreaId = (
  areas: readonly { id: string; outline: readonly GroundPoint[] }[],
  position: GroundPoint,
): string => {
  const nearest = findNearest(areas, ({ outline }) => computeOutlineDistance(outline, position.x, position.z));
  if (nearest === undefined) throw new InvalidOperationError(Operation.Read, findAreaId.name, "a region with no area");
  return nearest.id;
};
