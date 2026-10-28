import type { GameDataBuild } from "#src/models/shared/GameDataBuild";
import type { RegionMapPoint } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import type { SceneGroups } from "genshin-world";

import { findCraftingBenchMember } from "#src/services/genshinAssets/crafting/findCraftingBenchMember";
import { classifyPlacementRegion } from "#src/services/genshinAssets/residents/classifyPlacementRegion";
import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { REGION_MAX_DISTANCE } from "#src/services/genshinAssets/shared/constants";
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
