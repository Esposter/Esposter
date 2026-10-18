import { toWaypointLandmarks } from "#src/services/genshinAssets/fit/toWaypointLandmarks";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { CATALOGUE_PATH, WAYPOINT_REGIONS } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { catalogueSchema, LandmarkKind } from "genshin-world";
import { readFile } from "node:fs/promises";

// The Teleport Waypoints of each region in WAYPOINT_REGIONS, written into its region's data as landmarks of their own kind,
// Replacing the waypoints an earlier run wrote. Each is paired with the scene's transport point it stands at, and only the
// Official map points of the region's own map area are paired. A dry run counts them and writes nothing
export const fitRegionWaypoints = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const [{ origin, regionFiles }, { points, transform }, getWorldHeight, transportPoints] = await Promise.all([
    readFittedRegions(),
    readFittedMapPoints(),
    readWorldGroundHeight(),
    readSceneTransportPoints(),
  ]);
  const catalogue = catalogueSchema.parse(parseMachineJson(await readFile(CATALOGUE_PATH, "utf8")));
  const reports = await Promise.all(
    regionFiles
      .filter(({ region }) => WAYPOINT_REGIONS.includes(region))
      .map(async ({ data, file, region }) => {
        const mapRegion = InteractiveMapRegionMap[region];
        if (!mapRegion) throw new InvalidOperationError(Operation.Read, region, "has no region on the official map");
        const areas = catalogue.regions.find(({ id }) => id === region)?.areas;
        if (!areas) throw new InvalidOperationError(Operation.Read, CATALOGUE_PATH, `has no region ${region}`);
        const waypoints = toWaypointLandmarks({
          areas,
          getWorldHeight,
          mapPoints: points.filter(({ area_id }) => area_id === mapRegion.areaId),
          origin,
          region,
          transform,
          transportPoints,
        });
        const landmarks = [
          ...data.landmarks.filter(({ kind }) => kind !== LandmarkKind.TeleportWaypoint),
          ...waypoints,
        ];
        if (JSON.stringify(landmarks) !== JSON.stringify(data.landmarks) && !isDryRun)
          await writeWorldData(file, { ...data, landmarks });
        const unnamed = waypoints.filter(({ areaId }) => areaId === "").length;
        return `${region}: ${waypoints.length} waypoints placed, ${unnamed} in no catalogue area`;
      }),
  );
  return isDryRun ? [...reports, "nothing written"].join("\n") : reports.join("\n");
};
