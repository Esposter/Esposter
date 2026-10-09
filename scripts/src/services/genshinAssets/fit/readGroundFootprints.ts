import type { GroundFootprint } from "#src/models/genshinAssets/fit/GroundFootprint";
import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { GroundPoint } from "genshin-engine";
import type { Landmark } from "genshin-world";

import { GroundFootprintSource } from "#src/models/genshinAssets/fit/GroundFootprintSource";
import { RegionCapitalMap } from "#src/services/genshinAssets/fit/RegionCapitalMap";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { readCityAreas } from "#src/services/genshinAssets/world/readCityAreas";
import { selectCapitalCityArea } from "#src/services/genshinAssets/world/selectCapitalCityArea";
import { toCapitalWorldPlace } from "#src/services/genshinAssets/world/toCapitalWorldPlace";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every place a region file stands a landmark on inside a square round the centre, each a disc on its point: a
// Building's radius the half diagonal of the footprint its kit's options give, a capital's with none the farthest corner
// Of its city area's placements from its place, and any other the bar's radius. The city areas are read only when a
// Capital needs them
export const readGroundFootprints = async (
  centre: GroundPoint,
  halfSide: number,
  barRadius: number,
  origin: readonly [number, number, number],
): Promise<GroundFootprint[]> => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, "regions");
  const regionFiles = await readdir(regionsDirectory);
  const landmarks = (
    await Promise.all(
      regionFiles.map(
        async (file) =>
          parseMachineJson<{ landmarks: Landmark[] }>(await readFile(join(regionsDirectory, file), "utf8")).landmarks,
      ),
    )
  )
    .flat()
    .filter(
      ({ position }) => Math.abs(position.x - centre.x) <= halfSide && Math.abs(position.z - centre.z) <= halfSide,
    );
  let cityAreas: Promise<CityArea[]> | undefined;
  return Promise.all(
    landmarks.map(async (landmark): Promise<GroundFootprint> => {
      const {
        id,
        position: { x, z },
      } = landmark;
      const options = "building" in landmark ? landmark.building.options : undefined;
      if (options && "width" in options && "depth" in options)
        return {
          id,
          radius: roundFitted(Math.hypot(options.width, options.depth) / 2),
          source: GroundFootprintSource.BuildingKit,
          x,
          z,
        };
      const isCapital = Object.values(RegionCapitalMap).some(({ landmarkId }) => landmarkId === id);
      if (isCapital) {
        cityAreas ??= readCityAreas();
        const place = toCapitalWorldPlace({ x, z }, origin);
        const cityArea = selectCapitalCityArea(await cityAreas, place);
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
      return { id, radius: barRadius, source: GroundFootprintSource.BarRadius, x, z };
    }),
  );
};
