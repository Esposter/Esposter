import type { Catalogue } from "#src/models/world/Catalogue";
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

import { createAreaNameMap } from "#src/services/dev/createAreaNameMap";

// The first landmark a jump can land at in the place a teleport names: an area's own name first, then a region's, each
// Compared without case. A landmark nothing jumps to has no arrival and is passed over
export const findTeleportLandmark = (
  place: string,
  catalogue: Catalogue,
  landmarks: readonly PlaceLandmark[],
): PlaceLandmark | undefined => {
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
