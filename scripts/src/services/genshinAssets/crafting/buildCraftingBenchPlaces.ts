import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import type { SceneGroups } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import {
  MONDSTADT_CRAFTING_BENCH_GROUP_ID,
  MONDSTADT_CRAFTING_BENCH_NPC_ID,
} from "#src/services/genshinAssets/crafting/constants";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset, SceneGroupMemberKind } from "genshin-world";

// The crafting bench's place in its region's axes, carried as a resident's is: the NPC member the scene group record
// Places in the bench's group, classified into the fitted region it stands in, with its turn. The runtime cannot carry
// The game's place into a region's axes, since the origin is read from the assets, so the place is published that way
export const toCraftingBenchPlaces = (
  sceneGroups: SceneGroups,
  origin: readonly [number, number, number],
  regionMapPoints: readonly RegionMapPoint[],
): GameDataBuild => {
  const place = sceneGroups.groups[MONDSTADT_CRAFTING_BENCH_GROUP_ID]?.find(
    ({ kind, objectId }) => kind === SceneGroupMemberKind.Npc && objectId === MONDSTADT_CRAFTING_BENCH_NPC_ID,
  )?.place;
  if (!place) return { notes: ["the scene group record places no crafting bench, so none is published"], objects: {} };
  const region = classifyPlacementRegion(place.position, regionMapPoints, REGION_MAX_DISTANCE);
  if (region === undefined)
    return { notes: ["the crafting bench stands in no fitted region, so none is published"], objects: {} };
  const { position, rotation } = toResidentPlace(MONDSTADT_CRAFTING_BENCH_NPC_ID, place, region, origin);
  return {
    notes: [`${region}: the crafting bench's place`],
    objects: { [`${GameDataset.CraftingBenchPlaces}/${region}`]: { position, rotation } },
  };
};

export const buildCraftingBenchPlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, regions, transform }, sceneGroups] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
    readPublishedGameData<SceneGroups>(SCENE_GROUPS_KEY),
  ]);
  // A region the fit matched no statue or waypoint in is left out, since a place classified into it cannot be trusted
  const fittedRegions = regions.filter(({ residual }) => residual !== undefined);
  const regionMapPoints = toRegionMapPoints(points, transform).filter(({ region }) =>
    fittedRegions.some((fitted) => fitted.region === region),
  );
  return toCraftingBenchPlaces(sceneGroups, origin, regionMapPoints);
};
