import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { GROUND_RADIUS } from "#src/services/genshinAssets/shared/constants";
import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";
import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { readStreamPlacements } from "#src/services/genshinAssets/world/readStreamPlacements";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Windrise's plant placements as its streams record them, in the game's axes: every placement whose prefab is named a
// Plant, within the ground's radius of the oak's foot, grouped by prefab with the prefab's name. The oak is left out,
// Since its landmark already stands it. Both the fit and the layout pass read them, so the fitted data is checked
// Against the records it was fitted from
export const readWindrisePlantPlacements = async (): Promise<{
  origin: [number, number, number];
  plants: { name: string; places: WorldPlacement[] }[];
}> => {
  const world = await readWorldOptions(DerivedAssetComponent.Windrise);
  if (!world) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, "has no open world");
  const [origin, pathNames, streamPlacements] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readAssetPathNames(),
    Promise.all(world.streams.map((stream) => readStreamPlacements(DerivedAssetComponent.Windrise, stream))),
  ]);
  const placements = streamPlacements.flat();
  const prefabNames = getPrefabNames(placements, pathNames);
  const originPrefabIds = new Set(
    world.streams.flatMap(({ prefabs }) =>
      prefabs.filter(({ prefab }) => prefab.pathId === world.origin.pathId).map(({ prefabId }) => prefabId),
    ),
  );
  const [originX, , originZ] = origin;
  const checkIsPlantPlacement = ({ position: [x, , z], prefabId }: WorldPlacement): boolean =>
    !originPrefabIds.has(prefabId) &&
    checkIsPlantName(prefabNames.get(prefabId) || "") &&
    Math.hypot(x - originX, z - originZ) <= GROUND_RADIUS;
  const plantPlacements = placements.filter((placement) => checkIsPlantPlacement(placement));
  return {
    origin,
    plants: Array.from(
      Map.groupBy(plantPlacements, ({ prefabId }) => prefabId),
      ([prefabId, places]) => ({ name: prefabNames.get(prefabId) || "", places }),
    ),
  };
};
