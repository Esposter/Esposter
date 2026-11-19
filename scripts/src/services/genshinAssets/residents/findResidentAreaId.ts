import type { GroundPoint } from "genshin-engine";
import type { Catalogue } from "genshin-world";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";
import { checkIsOutlineInReach, findAreaAt } from "genshin-world";

// The catalogue area a resident belongs to: the area whose outline holds its place, since the game's records give a place
// And no area. A place no outline holds belongs to the area of its nearest landmark only when that area's outline is in
// Reach of the place, the distance the world loads an area at, and to none otherwise. A resident no area is in reach of is
// Left out, rather than filed under a guess
export const findResidentAreaId = (
  catalogue: Catalogue,
  landmarks: readonly { areaId: string; position: GroundPoint }[],
  position: GroundPoint,
): string | undefined => {
  const area = findAreaAt(catalogue, position.x, position.z);
  if (area) return area.id;
  const nearest = findNearest(landmarks, (landmark) =>
    Math.hypot(landmark.position.x - position.x, landmark.position.z - position.z),
  );
  if (!nearest) return undefined;
  const landmarkArea = catalogue.regions.flatMap(({ areas }) => areas).find(({ id }) => id === nearest.areaId);
  return landmarkArea && checkIsOutlineInReach(landmarkArea.outline, position.x, position.z)
    ? nearest.areaId
    : undefined;
};
