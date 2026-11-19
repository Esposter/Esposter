import type { GroundPoint } from "genshin-engine";
import type { Catalogue } from "genshin-world";

import { findNearest } from "#src/services/genshinAssets/shared/findNearest";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { findAreaAt } from "genshin-world";

// The catalogue area a resident belongs to: the area whose outline holds its place, since the game's records give a place
// And no area. A place no outline holds is filed under the area of the landmark nearest it, the only guess left, and a
// Region with no landmark has no area to file such a place under, which is an error
export const findResidentAreaId = (
  region: string,
  catalogue: Catalogue,
  landmarks: readonly { areaId: string; position: GroundPoint }[],
  position: GroundPoint,
): string => {
  const area = findAreaAt(catalogue, position.x, position.z);
  if (area) return area.id;
  const nearest = findNearest(landmarks, (landmark) =>
    Math.hypot(landmark.position.x - position.x, landmark.position.z - position.z),
  );
  if (!nearest) throw new InvalidOperationError(Operation.Read, region, "has no landmark to file a resident under");
  return nearest.areaId;
};
