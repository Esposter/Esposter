import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { GroundPoint } from "genshin-engine";
import type { DomainEntranceLandmark } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import {
  DOMAIN_ENTRANCE_REGION_MAX_DISTANCE,
  DUNGEON_ENTRY_TABLE_NAME,
  DungeonEntryTypeDomainKindMap,
} from "#src/services/genshinAssets/domains/constants";
import { readDomainScenePoints } from "#src/services/genshinAssets/domains/readDomainScenePoints";
import { toDomainEntrance } from "#src/services/genshinAssets/domains/toDomainEntrance";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { REGION_DATA_DIRECTORY } from "#src/services/genshinAssets/residents/constants";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { getOrCreate } from "@esposter/shared";
import { LandmarkKind } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region's data as its file holds it, its landmarks the domain entrances are filed under and every other field kept
type RegionDataFile = Record<string, unknown> & {
  landmarks: { areaId: string; kind?: string; position: GroundPoint }[];
};

// Each challenge domain's entrance of the open world written into the region its place is in, as a landmark of its own
// Kind. Each entry is placed from its scene point round the Windrise origin, and filed under the fitted region of the
// Official map point nearest it within reach, and under the landmark nearest it in that region. A region's other landmarks
// Stay as its file holds them, and its entrances from an earlier run are replaced. An entry with no point, or in no
// Fitted region, is counted and left out. A dry run counts the entrances and writes nothing
export const writeDomainEntrances = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const [[originX, originY, originZ], getWorldHeight, { points, regions, transform }, scenePoints] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readWorldGroundHeight(),
    readFittedMapPoints(),
    readDomainScenePoints(),
  ]);
  const fittedRegions = regions.filter(({ residual }) => residual !== undefined);
  // The map points carried into the region's axes, which the place is too: a mirror and a shift keep every distance
  const regionMapPoints = toRegionMapPoints(points, transform)
    .filter(({ region }) => fittedRegions.some((fitted) => fitted.region === region))
    .map(({ position, region }) => ({ position: { x: position.x - originX, z: originZ - position.z }, region }));
  const entries = readExcelTable<ExcelDungeonEntryRow>(DUNGEON_ENTRY_TABLE_NAME).filter(
    ({ sceneId, type }) => sceneId === OPEN_WORLD_SCENE_ID && DungeonEntryTypeDomainKindMap[type] !== undefined,
  );
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => {
      const path = join(REGION_DATA_DIRECTORY, `${region}.json`);
      return { data: parseMachineJson<RegionDataFile>(await readFile(path, "utf8")), path, region };
    }),
  );
  const otherLandmarksMap = new Map(
    regionFiles.map(({ data, region }) => [
      region,
      data.landmarks.filter(({ kind }) => kind !== LandmarkKind.DomainEntrance),
    ]),
  );
  const placedMap = new Map<string, DomainEntranceLandmark[]>();
  let noPointCount = 0;
  let noRegionCount = 0;
  for (const entry of entries) {
    const place = toDomainEntrance(entry, scenePoints[String(entry.dungeonEntryId)], [originX, originY, originZ]);
    if (!place) {
      noPointCount++;
      continue;
    }
    const region = classifyPlacementRegion(place.position, regionMapPoints, DOMAIN_ENTRANCE_REGION_MAX_DISTANCE);
    if (region === undefined) {
      noRegionCount++;
      continue;
    }
    const { height, ...landmark } = place;
    const areaId = findNearestLandmarkAreaId(region, otherLandmarksMap.get(region) ?? [], place.position);
    const heightOffset = roundFitted(height - originY - getWorldHeight(place.position.x, place.position.z));
    getOrCreate(placedMap, region, () => []).push({ ...landmark, areaId, heightOffset });
  }
  const reports = regionFiles.map(({ data, path, region }) => {
    const domainEntrances = placedMap.get(region) ?? [];
    const landmarks = [...(otherLandmarksMap.get(region) ?? []), ...domainEntrances];
    if (JSON.stringify(landmarks) !== JSON.stringify(data.landmarks) && !isDryRun)
      writeJsonFile(path, { ...data, landmarks });
    return `${region}: ${domainEntrances.length} domain entrances`;
  });
  return [
    ...reports,
    `${entries.length - noPointCount - noRegionCount} of ${entries.length} domain entrances placed, ${noPointCount} with no transport point, ${noRegionCount} in no fitted region${isDryRun ? ", nothing written" : ""}`,
  ].join("\n");
};
