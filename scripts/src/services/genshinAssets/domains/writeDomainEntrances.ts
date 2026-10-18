import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { DomainEntranceLandmark } from "genshin-world";

import { DUNGEON_ENTRY_TABLE_NAME } from "#src/services/genshinAssets/domains/constants";
import { getDomainEntryKind } from "#src/services/genshinAssets/domains/getDomainEntryKind";
import { readDomainEntrancePoints } from "#src/services/genshinAssets/domains/readDomainEntrancePoints";
import { toDomainEntrance } from "#src/services/genshinAssets/domains/toDomainEntrance";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { OPEN_WORLD_SCENE_ID, REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { toHeightOffset } from "#src/services/genshinAssets/shared/toHeightOffset";
import { toRegionAxesPosition } from "#src/services/genshinAssets/shared/toRegionAxesPosition";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { getOrCreate } from "@esposter/shared";
import { LandmarkKind } from "genshin-world";

// Each challenge domain's entrance of the open world written into the region its place is in, as a landmark of its own
// Kind. Each entry is placed from its scene point round the Windrise origin, and filed under the fitted region of the
// Official map point nearest it within reach, and under the landmark nearest it in that region. A region's other landmarks
// Stay as its file holds them, and its entrances from an earlier run are replaced. An entry with no point, or in no
// Fitted region, is counted and left out. A dry run counts the entrances and writes nothing
export const writeDomainEntrances = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const [{ origin, regionFiles, regionMapPoints }, getWorldHeight, scenePoints] = await Promise.all([
    readFittedRegions(),
    readWorldGroundHeight(),
    readDomainEntrancePoints(),
  ]);
  const [, originY] = origin;
  // The map points carried into the region's axes, which the place is too: a mirror and a shift keep every distance.
  // Stay unrounded, since a rounding could tip a near tie between two regions
  const axesMapPoints = regionMapPoints.map(({ position, region }) => ({
    position: toRegionAxesPosition(position, origin),
    region,
  }));
  const entries = readExcelTable<ExcelDungeonEntryRow>(DUNGEON_ENTRY_TABLE_NAME).filter(
    (entry) => entry.sceneId === OPEN_WORLD_SCENE_ID && getDomainEntryKind(entry) !== undefined,
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
    const place = toDomainEntrance(entry, scenePoints[String(entry.dungeonEntryId)], origin);
    if (!place) {
      noPointCount++;
      continue;
    }
    const region = classifyPlacementRegion(place.position, axesMapPoints, REGION_MAX_DISTANCE);
    if (region === undefined) {
      noRegionCount++;
      continue;
    }
    const { height, ...landmark } = place;
    const areaId = findNearestLandmarkAreaId(region, otherLandmarksMap.get(region) ?? [], place.position);
    const heightOffset = toHeightOffset(height, originY, place.position, getWorldHeight);
    // The arrival is provisionally the entrance's own place, until the domain's scene export gives its transfer point
    getOrCreate(placedMap, region, () => []).push({
      ...landmark,
      areaId,
      arrival: { heightOffset, position: landmark.position, rotation: landmark.rotation },
      heightOffset,
    });
  }
  const reports = await Promise.all(
    regionFiles.map(async ({ data, file, region }) => {
      const domainEntrances = placedMap.get(region) ?? [];
      const landmarks = [...(otherLandmarksMap.get(region) ?? []), ...domainEntrances];
      if (JSON.stringify(landmarks) !== JSON.stringify(data.landmarks) && !isDryRun)
        await writeWorldData(file, { ...data, landmarks });
      return `${region}: ${domainEntrances.length} domain entrances`;
    }),
  );
  return [
    ...reports,
    `${entries.length - noPointCount - noRegionCount} of ${entries.length} domain entrances placed, ${noPointCount} with no transport point, ${noRegionCount} in no fitted region${isDryRun ? ", nothing written" : ""}`,
  ].join("\n");
};
