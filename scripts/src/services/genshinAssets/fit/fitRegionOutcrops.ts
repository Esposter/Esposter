import { toOutcropPlaces } from "#src/services/genshinAssets/fit/toOutcropPlaces";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { OUTCROP_REGIONS } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The Ley Line Blossoms of the official map in each region of OUTCROP_REGIONS, written into its region's data as its outcrop
// Places, replacing the places an earlier run wrote. A dry run counts them and writes nothing
export const fitRegionOutcrops = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const [{ origin, regionFiles }, { points, transform }] = await Promise.all([
    readFittedRegions(),
    readFittedMapPoints(),
  ]);
  const reports = await Promise.all(
    regionFiles
      .filter(({ region }) => OUTCROP_REGIONS.includes(region))
      .map(async ({ data, file, region }) => {
        const mapRegion = InteractiveMapRegionMap[region];
        if (!mapRegion) throw new InvalidOperationError(Operation.Read, region, "has no region on the official map");
        const outcropPlaces = toOutcropPlaces({ areaId: mapRegion.areaId, mapPoints: points, origin, transform });
        if (JSON.stringify(outcropPlaces) !== JSON.stringify(data.outcropPlaces ?? []) && !isDryRun)
          await writeWorldData(file, { ...data, outcropPlaces });
        return `${region}: ${outcropPlaces.length} outcrop places placed`;
      }),
  );
  return isDryRun ? [...reports, "nothing written"].join("\n") : reports.join("\n");
};
