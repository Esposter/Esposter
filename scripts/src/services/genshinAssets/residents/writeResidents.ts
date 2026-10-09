import type { InteractiveMapFitFile } from "#src/models/genshinAssets/points/InteractiveMapFitFile";
import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { GroundPoint } from "genshin-engine";

import type { Resident } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { INTERACTIVE_MAP_FIT_PATH } from "#src/services/genshinAssets/points/constants";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { REGION_DATA_DIRECTORY, RESIDENT_REGION_MAX_DISTANCE } from "#src/services/genshinAssets/residents/constants";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { joinResidents } from "#src/services/genshinAssets/residents/joinResidents";
import { mapSpeakerTalkIds } from "#src/services/genshinAssets/residents/mapSpeakerTalkIds";
import { readDialogSpeakers } from "#src/services/genshinAssets/residents/readDialogSpeakers";
import { readNpcBornRecords } from "#src/services/genshinAssets/residents/readNpcBornRecords";
import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { NPC_PATH } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { residentSchema } from "genshin-world";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// A region's data as its file holds it, its landmarks the residents are filed under and every other field kept
type RegionDataFile = Record<string, unknown> & {
  landmarks: { areaId: string; position: GroundPoint }[];
  residents?: Resident[];
};

// Every NPC the open world places, joined to the game's name and talk and written into the residents of each region the
// Official map fitted to the scene. A region the fit matched no statue or waypoint in is left out, since its places
// Cannot be trusted. The report counts each region's residents, the ones with a night spot and what was left out
export const writeResidents = async (): Promise<string> => {
  const [origin, { points, transform }, fitContent] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
    readFile(INTERACTIVE_MAP_FIT_PATH, "utf8"),
  ]);
  const fittedRegions = parseMachineJson<InteractiveMapFitFile>(fitContent).regions.filter(
    ({ residual }) => residual !== undefined,
  );
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => {
      const path = join(REGION_DATA_DIRECTORY, `${region}.json`);
      return { data: parseMachineJson<RegionDataFile>(await readFile(path, "utf8")), path, region };
    }),
  );
  const regionMapPoints = toRegionMapPoints(points, transform).filter(({ region }) =>
    fittedRegions.some((fitted) => fitted.region === region),
  );
  const births = await readNpcBornRecords();
  const placements = births.flatMap((record) => {
    const { _pos } = record;
    const region = classifyPlacementRegion({ x: _pos.x, z: _pos.z }, regionMapPoints, RESIDENT_REGION_MAX_DISTANCE);
    return region === undefined ? [] : [toResidentPlace(record, region, origin)];
  });
  const npcs = parseMachineJson<DumpedNpc[]>(await readFile(NPC_PATH, "utf8"));
  const nameTextIdMap = new Map(
    npcs.flatMap(({ id, nameTextMapHash }) => (nameTextMapHash === 0 ? [] : [[id, String(nameTextMapHash)] as const])),
  );
  const talkIdMap = mapSpeakerTalkIds(await readDialogSpeakers());
  const landmarksMap = new Map(regionFiles.map(({ data, region }) => [region, data.landmarks] as const));
  const residentJoin = joinResidents(placements, nameTextIdMap, talkIdMap, (region, position) =>
    findNearestLandmarkAreaId(region, landmarksMap.get(region) ?? [], position),
  );
  const reports = await Promise.all(
    regionFiles.map(async ({ data, path, region }) => {
      const residents: Resident[] = residentSchema.array().parse(residentJoin.regions.get(region) ?? []);
      if (JSON.stringify(residents) !== JSON.stringify(data.residents ?? []))
        await writeFile(path, `${JSON.stringify({ ...data, residents }, undefined, 2)}\n`);
      const withNight = residents.filter(({ night }) => night !== undefined).length;
      return `${region}: ${residents.length} placed with talks, ${residents.length - withNight} with a day spot only, ${withNight} with a night spot`;
    }),
  );
  return [
    ...reports,
    `${residentJoin.noName} with no name, ${residentJoin.noTalk} with no talk, ${residentJoin.repeated} repeat placements of a resident already placed, and ${births.length - placements.length} of ${births.length} birth records in no fitted region`,
  ].join("\n");
};
