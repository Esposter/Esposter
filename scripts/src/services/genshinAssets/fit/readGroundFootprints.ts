import type { GroundFootprint } from "#src/models/genshinAssets/fit/GroundFootprint";
import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";

import { GroundFootprintSource } from "#src/models/genshinAssets/fit/GroundFootprintSource";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeExtentGap } from "#src/services/genshinAssets/world/computeExtentGap";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { toPointExtent } from "#src/services/genshinAssets/world/toPointExtent";

// Every place a region file stands a landmark on inside a square round the centre, each a disc on its point: a capital's
// Radius the farthest corner of its city area's placements from its place, since the city's whole architecture stands
// On it, another building's the half diagonal of the footprint its kit's options give, and any other the bar's radius.
// Beside them, each capital's city, whose buildings and plazas own the ground's height inside it: the city areas its
// Place stands in and every one within the bar's radius of those, since a capital is laid out across several (Inazuma
// City's lower town, upper town and keep). The city areas are read only when a capital needs them, once for the region
export const readGroundFootprints = async (
  { getCityAreas, landmarks, origin }: GroundSource,
  centre: GroundPoint,
  halfSide: number,
  barRadius: number,
): Promise<{ cityAreas: CityArea[]; footprints: GroundFootprint[] }> => {
  const squareLandmarks = landmarks.filter(
    ({ position }) => Math.abs(position.x - centre.x) <= halfSide && Math.abs(position.z - centre.z) <= halfSide,
  );
  const capitalCityAreas = new Set<CityArea>();
  const footprints = await Promise.all(
    squareLandmarks.map(async (landmark): Promise<GroundFootprint> => {
      const {
        id,
        position: { x, z },
      } = landmark;
      const isCapital = Object.values(RegionCapitalMap).some(({ landmarkId }) => landmarkId === id);
      if (isCapital) {
        const areas = await getCityAreas();
        const place = toCapitalWorldPlace({ x, z }, origin);
        const placeExtent = toPointExtent(place);
        const standingAreas = areas.filter(({ extent }) => computeExtentGap(extent, placeExtent) === 0);
        for (const area of areas)
          if (standingAreas.some(({ extent }) => computeExtentGap(extent, area.extent) < barRadius))
            capitalCityAreas.add(area);
        const cityArea = selectCapitalCityArea(areas, place);
        if (cityArea) {
          const { maxX, maxZ, minX, minZ } = cityArea.extent;
          const radius = Math.max(
            ...[minX, maxX].flatMap((cornerX) =>
              [minZ, maxZ].map((cornerZ) => Math.hypot(cornerX - place.x, cornerZ - place.z)),
            ),
          );
          return { id, radius: roundFitted(radius), source: GroundFootprintSource.CityArea, x, z };
        }
      }
      const options = "building" in landmark ? landmark.building.options : undefined;
      if (options && "width" in options && "depth" in options)
        return {
          id,
          radius: roundFitted(Math.hypot(options.width, options.depth) / 2),
          source: GroundFootprintSource.BuildingKit,
          x,
          z,
        };
      return { id, radius: barRadius, source: GroundFootprintSource.BarRadius, x, z };
    }),
  );
  return { cityAreas: [...capitalCityAreas], footprints };
};
