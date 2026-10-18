import type { Element } from "#src/models/Element";

import { RegionIdTravelerElementMap } from "#src/services/statue/RegionIdTravelerElementMap";

// The element the Traveler holds: the one of the region whose statue it resonated with last, of the regions given in the
// Order it resonated with them. It holds none until a statue is resonated with
export const computeTravelerElement = (resonatedRegionIds: string[]): Element | undefined => {
  const regionId = resonatedRegionIds.findLast((id) => RegionIdTravelerElementMap[id] !== undefined);
  return regionId === undefined ? undefined : RegionIdTravelerElementMap[regionId];
};
