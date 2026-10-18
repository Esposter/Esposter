import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import type { SceneGroups } from "genshin-world";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { findCraftingBenchMember } from "#src/services/genshinAssets/crafting/findCraftingBenchMember";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { toFittedMapPoints } from "#src/services/genshinAssets/residents/toFittedMapPoints";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { SCENE_GROUPS_KEY } from "#src/services/genshinAssets/sceneGroups/constants";
import { REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset } from "genshin-world";

// The crafting bench's place in its region's axes, carried as a resident's is: the NPC member the scene group record
// Places in the bench's group, classified into the fitted region it stands in, with its turn. The runtime cannot carry
// The game's place into a region's axes, since the origin is read from the assets, so the place is published that way
export const toCraftingBenchPlaces = (
  sceneGroups: SceneGroups,
  origin: readonly [number, number, number],
  regionMapPoints: readonly RegionMapPoint[],
): GameDataBuild => {
  const member = findCraftingBenchMember(sceneGroups);
  if (!member?.place)
    return { notes: ["the scene group record places no crafting bench, so none is published"], objects: {} };
  const region = classifyPlacementRegion(member.place.position, regionMapPoints, REGION_MAX_DISTANCE);
  if (region === undefined)
    return { notes: ["the crafting bench stands in no fitted region, so none is published"], objects: {} };
  const { position, rotation } = toResidentPlace(member.objectId, member.place, region, origin);
  return {
    notes: [`${region}: the crafting bench's place`],
    objects: { [`${GameDataset.CraftingBenchPlaces}/${region}`]: { position, rotation } },
  };
};

export const buildCraftingBenchPlaces = async (): Promise<GameDataBuild> => {
  const [origin, fittedMapPoints, sceneGroups] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
    readPublishedGameData<SceneGroups>(SCENE_GROUPS_KEY),
  ]);
  const { regionMapPoints } = toFittedMapPoints(fittedMapPoints);
  return toCraftingBenchPlaces(sceneGroups, origin, regionMapPoints);
};
