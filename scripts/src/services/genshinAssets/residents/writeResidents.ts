import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { Resident, SceneGroupPlace, SceneGroups } from "genshin-world";

import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { MONDSTADT_CRAFTING_KEEPER_NPC_ID } from "#src/services/genshinAssets/crafting/constants";
import { findCraftingBenchMember } from "#src/services/genshinAssets/crafting/findCraftingBenchMember";
import { toCraftingKeeperPlace } from "#src/services/genshinAssets/crafting/toCraftingKeeperPlace";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import {
  BUILDING_NPC_ID_MAP,
  CRAFTING_BENCH_NPC_ID_MAP,
  REPUTATION_KEEPER_NPC_ID_MAP,
  RESIDENT_DUEL_GAME_ID_MAP,
  RESIDENT_WEEK_GAME_MAP,
} from "#src/services/genshinAssets/residents/constants";
import { findNearestLandmarkAreaId } from "#src/services/genshinAssets/residents/findNearestLandmarkAreaId";
import { joinResidents } from "#src/services/genshinAssets/residents/joinResidents";
import { mapSpeakerTalkIds } from "#src/services/genshinAssets/residents/mapSpeakerTalkIds";
import { readDialogSpeakers } from "#src/services/genshinAssets/residents/readDialogSpeakers";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { NPC_TABLE_NAME } from "#src/services/genshinText/constants";
import { mapNpcStandingTalkIds } from "#src/services/genshinText/mapNpcStandingTalkIds";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTalkConfigs } from "#src/services/genshinText/readTalkConfigs";
import { residentSchema, SceneGroupMemberKind } from "genshin-world";

// Every NPC the scene group record places, in its groups' order, joined to the game's name and talk and written into the
// Residents of each region the official map fitted to the scene. A region the fit matched no statue or waypoint in is left out, since its places
// Cannot be trusted. The talk F begins with an NPC is its standing talk where the talk table gives it one, else the
// Lowest-numbered talk it speaks in. The report counts each region's residents, the ones with a night spot and what was
// Left out. A dry run reports the same and writes no region data
export const writeResidents = async ({ isDryRun }: { isDryRun: boolean }): Promise<string> => {
  const { origin, regionFiles, regionMapPoints } = await readFittedRegions();
  const sceneGroups = await readPublishedGameData<SceneGroups>(SCENE_GROUPS_KEY);
  const craftingBench = findCraftingBenchMember(sceneGroups);
  // The keeper beside the bench has no birth in the scene group record, so his place is the bench's, moved beside it
  const craftingKeeperPlaces: [number, SceneGroupPlace][] = craftingBench?.place
    ? [[MONDSTADT_CRAFTING_KEEPER_NPC_ID, toCraftingKeeperPlace(craftingBench.place)]]
    : [];
  const npcPlaces = [
    ...Object.values(sceneGroups.groups).flatMap((members) =>
      members.flatMap(({ kind, objectId, place }): [number, SceneGroupPlace][] =>
        kind === SceneGroupMemberKind.Npc && place ? [[objectId, place]] : [],
      ),
    ),
    ...Object.entries(sceneGroups.buildings).flatMap(([buildingId, { name, place }]): [number, SceneGroupPlace][] => {
      const keeperNpcId = BUILDING_NPC_ID_MAP.get(buildingId) ?? REPUTATION_KEEPER_NPC_ID_MAP.get(name);
      return keeperNpcId === undefined ? [] : [[keeperNpcId, place]];
    }),
    ...craftingKeeperPlaces,
    // An NPC who stands beside a bench is placed beside the bench's building point, as Mondstadt's keeper is beside his bench
    ...Object.entries(sceneGroups.buildings).flatMap(([buildingId, { place }]): [number, SceneGroupPlace][] => {
      const benchNpcId = CRAFTING_BENCH_NPC_ID_MAP.get(buildingId);
      return benchNpcId === undefined ? [] : [[benchNpcId, toCraftingKeeperPlace(place)]];
    }),
  ];
  const reputationKeeperIds = new Set(Array.from(REPUTATION_KEEPER_NPC_ID_MAP.values(), String));
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
  const craftingBenchNpcIds = new Set(craftingBench ? [craftingBench.objectId] : []);
  const residentJoin = joinResidents(
    placements,
    nameTextIdMap,
    talkIdMap,
    (region, position) => findNearestLandmarkAreaId(region, landmarksMap.get(region) ?? [], position),
    craftingBenchNpcIds,
  );
  const reports = await Promise.all(
    regionFiles.map(async ({ data, file, region }) => {
      const residents: Resident[] = residentSchema
        .array()
        .parse(
          (residentJoin.regions.get(region) ?? []).map((resident) =>
            Object.assign(resident, {
              duelGameId: RESIDENT_DUEL_GAME_ID_MAP.get(resident.id),
              weekGame: RESIDENT_WEEK_GAME_MAP.get(resident.id),
              keepsReputation: reputationKeeperIds.has(resident.id) ? true : undefined,
            }),
          ),
        );
      if (!isDryRun && JSON.stringify(residents) !== JSON.stringify(data.residents ?? []))
        await writeWorldData(file, { ...data, residents });
      const withNight = residents.filter(({ night }) => night !== undefined).length;
      return `${region}: ${residents.length} placed with talks, ${residents.length - withNight} with a day spot only, ${withNight} with a night spot`;
    }),
  );
  return [
    ...reports,
    `${residentJoin.craftingBench} at a crafting bench, ${residentJoin.noName} with no name, ${residentJoin.noTalk} with no talk, ${residentJoin.repeated} repeat placements of a resident already placed, and ${npcPlaces.length - placements.length} of ${npcPlaces.length} placed NPCs in no fitted region`,
    ...(isDryRun ? ["nothing written"] : []),
  ].join("\n");
};
