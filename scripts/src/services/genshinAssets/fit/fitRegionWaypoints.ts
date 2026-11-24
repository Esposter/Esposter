import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { selectFittedRegions } from "#src/services/genshinAssets/fit/selectFittedRegions";
import { toPairedLandmarks } from "#src/services/genshinAssets/fit/toPairedLandmarks";
import {
  INTERACTIVE_MAP_STATUE_LABEL_ID,
  INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import {
  CATALOGUE_PATH,
  NEW_MOON_STATUE_REGIONS,
  WAYPOINT_REGIONS,
} from "#src/services/genshinAssets/shared/constants";
import { orderLandmarks } from "#src/services/genshinAssets/shared/orderLandmarks";
import { readRegionData } from "#src/services/genshinAssets/shared/readRegionData";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { writeRegionData } from "#src/services/genshinAssets/shared/writeRegionData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { catalogueSchema, LandmarkKind } from "genshin-world";
import { readFile } from "node:fs/promises";

// The kinds the official map's labels pair, each with the label it is read from and the word its id carries. A Statue
// Of the Seven's label holds the Statues of the New Moon of Nod-Krai's map area, as the map files them
const WAYPOINT_PAIRING = {
  idWord: "waypoint",
  kind: LandmarkKind.TeleportWaypoint,
  labelId: INTERACTIVE_MAP_WAYPOINT_LABEL_ID,
} as const;
const NEW_MOON_STATUE_PAIRING = {
  idWord: "new-moon-statue",
  kind: LandmarkKind.StatueOfTheNewMoon,
  labelId: INTERACTIVE_MAP_STATUE_LABEL_ID,
} as const;
const PAIRED_LANDMARK_KINDS = new Set<string | undefined>([NEW_MOON_STATUE_PAIRING.kind, WAYPOINT_PAIRING.kind]);

// The Teleport Waypoints of each region in WAYPOINT_REGIONS and the Statues of the New Moon of each in
// NEW_MOON_STATUE_REGIONS, written into its region's data as landmarks of their own kinds, replacing the ones an
// Earlier run wrote. Each is paired with the scene's transport point it stands at, and only the official map points of
// The region's own map area are paired. A dry run counts them and writes nothing
export const fitRegionWaypoints = async ({ isDryRun }: DryRunOptions): Promise<string> => {
  const [{ origin, points, regionFits, transform }, getWorldHeight, transportPoints] = await Promise.all([
    readFittedRegions(),
    readWorldGroundHeight(),
    readSceneTransportPoints(),
  ]);
  const catalogue = catalogueSchema.parse(parseMachineJson(await readFile(CATALOGUE_PATH, "utf8")));
  // A region whose map fit is over its bar writes no waypoints, so the ones an earlier run wrote are replaced by none.
  // Every region of the two lists is read, not only those the fit placed, since a region it matched nothing in still
  // Holds the earlier run's waypoints
  const fittedWaypointRegions = selectFittedRegions(regionFits, WAYPOINT_REGIONS);
  const reports = await Promise.all(
    [...WAYPOINT_REGIONS, ...NEW_MOON_STATUE_REGIONS].map(async (region) => {
      const { data, file } = await readRegionData(region);
      const mapRegion = InteractiveMapRegionMap[region];
      if (!mapRegion) throw new InvalidOperationError(Operation.Read, region, "has no region on the official map");
      const areas = catalogue.regions.find(({ id }) => id === region)?.areas;
      if (!areas) throw new InvalidOperationError(Operation.Read, CATALOGUE_PATH, `has no region ${region}`);
      const pair = (pairing: typeof NEW_MOON_STATUE_PAIRING | typeof WAYPOINT_PAIRING) =>
        toPairedLandmarks({
          ...pairing,
          areas,
          getWorldHeight,
          mapPoints: points.filter(({ area_id }) => area_id === mapRegion.areaId),
          origin,
          region,
          transform,
          transportPoints,
        });
      const waypoints = fittedWaypointRegions.includes(region) ? pair(WAYPOINT_PAIRING) : [];
      const statues = NEW_MOON_STATUE_REGIONS.includes(region) ? pair(NEW_MOON_STATUE_PAIRING) : [];
      const landmarks = orderLandmarks([
        ...data.landmarks.filter(({ kind }) => !PAIRED_LANDMARK_KINDS.has(kind)),
        ...waypoints,
        ...statues,
      ]);
      if (JSON.stringify(landmarks) !== JSON.stringify(data.landmarks) && !isDryRun)
        await writeRegionData(file, { ...data, landmarks });
      return `${region}: ${waypoints.length} waypoints and ${statues.length} Statues of the New Moon placed`;
    }),
  );
  return isDryRun ? [...reports, "nothing written"].join("\n") : reports.join("\n");
};
