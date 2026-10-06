import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a part of the open world's own scene stands round in the game's axes: the first place the world sets its
// Origin prefab down
export const readWorldOrigin = async (component: DerivedAssetComponent): Promise<[number, number, number]> => {
  const { world } = DerivedAssetComponentMap[component];
  const placements = await readWorldPlacements(component);
  const place = placements.find(({ prefab }) => prefab.pathId === world?.origin.pathId)?.places[0];
  if (!place) throw new InvalidOperationError(Operation.Read, component, "places its origin prefab nowhere");
  return place.position;
};
