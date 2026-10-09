import type { CookingZones } from "#src/models/cooking/CookingZones";

import { DELICIOUS_ZONE_SHARE } from "#src/services/cooking/constants";

// The zones of a recipe's indicator from its zone parameters, the first the centre of the regular zone along the bar and
// The second its width. Provisional: the delicious zone's share of it is DELICIOUS_ZONE_SHARE until the recording reads it
export const readCookingZones = ([centre, regularWidth]: [number, number]): CookingZones => {
  const regularHalfWidth = regularWidth / 2;
  const deliciousHalfWidth = regularHalfWidth * DELICIOUS_ZONE_SHARE;
  return {
    delicious: [centre - deliciousHalfWidth, centre + deliciousHalfWidth],
    regular: [centre - regularHalfWidth, centre + regularHalfWidth],
  };
};
