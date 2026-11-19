import { InvalidOperationError, Operation } from "@esposter/shared";

// Each region's city, inverted from each city's region, so the world reads the city a region's ley line kinds and statue
// Unlock are read by. A region holding two cities is refused, since the world holds one city to a region
export const toRegionCityIds = (cityRegionMap: ReadonlyMap<number, string>): Record<string, number> => {
  const regionCityIds = new Map<string, number>();
  for (const [cityId, region] of cityRegionMap) {
    const heldCityId = regionCityIds.get(region);
    if (heldCityId !== undefined)
      throw new InvalidOperationError(Operation.Read, region, `holds cities ${heldCityId} and ${cityId}`);
    regionCityIds.set(region, cityId);
  }
  return Object.fromEntries(regionCityIds);
};
