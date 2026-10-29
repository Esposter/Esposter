import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";

import { createAreaNameMap } from "#src/services/world/createAreaNameMap";

// The first landmark a jump can land at in the place a teleport names: an area's own name first, then a region's, each
// Compared without case. A landmark nothing jumps to has no arrival and is passed over
export const findTeleportLandmark = (
  place: string,
  catalogue: Catalogue,
  landmarks: readonly Landmark[],
): Landmark | undefined => {
  const lowerCasePlace = place.toLowerCase();
  const reachableLandmarks = landmarks.filter(({ arrival }) => arrival !== undefined);
  const areaNames = createAreaNameMap(catalogue);
  const regionNames = new Map(
    catalogue.regions.flatMap(({ areas, name }) => areas.map(({ id }) => [id, name] as const)),
  );
  return (
    reachableLandmarks.find(({ areaId }) => areaNames.get(areaId)?.toLowerCase() === lowerCasePlace) ??
    reachableLandmarks.find(({ areaId }) => regionNames.get(areaId)?.toLowerCase() === lowerCasePlace)
  );
};
