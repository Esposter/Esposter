import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { GroundPoint } from "genshin-engine";
import type { Resident, SceneGroupPlace, SceneGroups } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { REGION_DATA_DIRECTORY, RESIDENT_DUEL_GAME_ID_MAP } from "#src/services/genshinAssets/residents/constants";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { joinResidents } from "#src/services/genshinAssets/residents/joinResidents";
import { mapSpeakerTalkIds } from "#src/services/genshinAssets/residents/mapSpeakerTalkIds";
import { readDialogSpeakers } from "#src/services/genshinAssets/residents/readDialogSpeakers";
import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { NPC_TABLE_NAME } from "#src/services/genshinText/constants";
import { mapNpcStandingTalkIds } from "#src/services/genshinText/mapNpcStandingTalkIds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { residentSchema, SceneGroupMemberKind } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A region's data as its file holds it, its landmarks the residents are filed under and every other field kept
type RegionDataFile = Record<string, unknown> & {
  landmarks: { areaId: string; position: GroundPoint }[];
  residents?: Resident[];
};

// Every NPC the scene group record places, in its groups' order, joined to the game's name and talk and written into the
// Residents of each region the official map fitted to the scene. A region the fit matched no statue or waypoint in is left out, since its places
// Cannot be trusted. The talk F begins with an NPC is its standing talk where the talk table gives it one, else the
// Lowest-numbered talk it speaks in. The report counts each region's residents, the ones with a night spot and what was
// Left out
export const writeResidents = async (): Promise<string> => {
  const [origin, { points, regions, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const fittedRegions = regions.filter(({ residual }) => residual !== undefined);
  const regionFiles = await Promise.all(
    fittedRegions.map(async ({ region }) => {
      const path = join(REGION_DATA_DIRECTORY, `${region}.json`);
      return { data: parseMachineJson<RegionDataFile>(await readFile(path, "utf8")), path, region };
    }),
  );
  const regionMapPoints = toRegionMapPoints(points, transform).filter(({ region }) =>
    fittedRegions.some((fitted) => fitted.region === region),
  );
  const { groups } = await readPublishedGameData<SceneGroups>(SCENE_GROUPS_KEY);
  const npcPlaces = Object.values(groups).flatMap((members) =>
    members.flatMap(({ kind, objectId, place }): [number, SceneGroupPlace][] =>
      kind === SceneGroupMemberKind.Npc && place ? [[objectId, place]] : [],
    ),
  );
  const placements = npcPlaces.flatMap(([npcId, place]) => {
    const region = classifyPlacementRegion(place.position, regionMapPoints, REGION_MAX_DISTANCE);
    return region === undefined ? [] : [toResidentPlace(npcId, place, region, origin)];
  });
  const npcs = readExcelTable<DumpedNpc>(NPC_TABLE_NAME);
  const nameTextIdMap = new Map(
    npcs.flatMap(({ id, nameTextMapHash }) => (nameTextMapHash === 0 ? [] : [[id, String(nameTextMapHash)] as const])),
  );
  const speakers = readDialogSpeakers();
  const talkConfigs = await readTalkConfigs();
  const talkIdMap = new Map([...mapSpeakerTalkIds(speakers), ...mapNpcStandingTalkIds(talkConfigs)]);
  const landmarksMap = new Map(regionFiles.map(({ data, region }) => [region, data.landmarks] as const));
  const residentJoin = joinResidents(placements, nameTextIdMap, talkIdMap, (region, position) =>
    findNearestLandmarkAreaId(region, landmarksMap.get(region) ?? [], position),
  );
  const reports = regionFiles.map(({ data, path, region }) => {
    const residents: Resident[] = residentSchema
      .array()
      .parse(
        (residentJoin.regions.get(region) ?? []).map((resident) =>
          Object.assign(resident, { duelGameId: RESIDENT_DUEL_GAME_ID_MAP.get(resident.id) }),
        ),
      );
    if (JSON.stringify(residents) !== JSON.stringify(data.residents ?? [])) writeJsonFile(path, { ...data, residents });
    const withNight = residents.filter(({ night }) => night !== undefined).length;
    return `${region}: ${residents.length} placed with talks, ${residents.length - withNight} with a day spot only, ${withNight} with a night spot`;
  });
  return [
    ...reports,
    `${residentJoin.noName} with no name, ${residentJoin.noTalk} with no talk, ${residentJoin.repeated} repeat placements of a resident already placed, and ${npcPlaces.length - placements.length} of ${npcPlaces.length} placed NPCs in no fitted region`,
  ].join("\n");
};
