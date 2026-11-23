import type { GroundPieceKey } from "#src/models/world/GroundPieceKey";

import { GROUND_GROUP_SEPARATOR, GROUND_KEY_SEPARATOR } from "#src/services/world/constants";

// A ground key read back into its parts, the inverse of `getGroundPieceKey`: its region and area, then each level of
// The Split under the area as its quarter indices, so `ground/r/a/3/1-3` is quarter 3, then quarters 1 and 3 of it
// Joined
export const parseGroundPieceKey = (key: string): GroundPieceKey => {
  const [, region = "", area, ...levels] = key.split(GROUND_KEY_SEPARATOR);
  return { area, path: levels.map((level) => level.split(GROUND_GROUP_SEPARATOR).map(Number)), region };
};
