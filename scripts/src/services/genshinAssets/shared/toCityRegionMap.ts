import type { DumpedCity } from "#src/models/genshinText/DumpedCity";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Each city's region, read off its areas: a city lies in the region its areas lie in, as the catalogue names them, so
// No Region is written by hand. A city none of whose areas a region holds has none, and a city whose areas lie in two
// Regions is refused
export const toCityRegionMap = (
  cities: readonly DumpedCity[],
  areaPlaceMap: ReadonlyMap<number, { region: string }>,
): Map<number, string> => {
  const cityRegionMap = new Map<number, string>();
  for (const { areaIdVec, cityId } of cities) {
    const regions = [...new Set(areaIdVec.flatMap((areaId) => areaPlaceMap.get(areaId)?.region ?? []))];
    if (regions.length > 1)
      throw new InvalidOperationError(Operation.Read, `city ${cityId}`, `has areas in ${regions.join(", ")}`);
    const [region] = regions;
    if (region !== undefined) cityRegionMap.set(cityId, region);
  }
  return cityRegionMap;
};
