import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readWorldPlacements } from "#src/services/genshinAssets/world/readWorldPlacements";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Where a part of the open world's own scene stands round in the game's axes: the first place the world sets its
// Origin prefab down. A region is set round the same origin as Windrise's, the oak's foot, so its origin is read there
export const readWorldOrigin = async (component: DerivedAssetComponent): Promise<[number, number, number]> => {
  const originComponent = DerivedAssetComponentMap[component].world ? component : DerivedAssetComponent.Windrise;
  const { world } = DerivedAssetComponentMap[originComponent];
  const placements = await readWorldPlacements(originComponent);
  const place = placements.find(({ prefab }) => prefab.pathId === world?.origin.pathId)?.places[0];
  if (!place) throw new InvalidOperationError(Operation.Read, originComponent, "places its origin prefab nowhere");
  return place.position;
};
