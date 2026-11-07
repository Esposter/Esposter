import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";
import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { readStreamPlacements } from "#src/services/genshinAssets/world/readStreamPlacements";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A component's plant placements as its streams record them, in the game's axes: every placement whose prefab is named
// A plant, grouped by prefab with the prefab's name. Every such placement is kept, since what the game places stands
// Where it places it. The origin prefab is left out, since its landmark already stands it. Both the fit and the scene's
// Plant family read them, so the fitted data is checked against the records it was fitted from.
export const readPlantPlacements = async (
  component: DerivedAssetComponent,
): Promise<{ origin: [number, number, number]; plants: { name: string; places: WorldPlacement[] }[] }> => {
  const world = await readWorldOptions(component);
  if (!world) throw new InvalidOperationError(Operation.Read, component, "has no open world");
  const [origin, pathNames, streamPlacements] = await Promise.all([
    readWorldOrigin(component),
    readAssetPathNames(),
    Promise.all(world.streams.map((stream) => readStreamPlacements(component, stream))),
  ]);
  const placements = streamPlacements.flat();
  // A derived world names each prefab it lists, while a placement's path hash names only some prefabs, so the listed
  // Names come first and the path hashes name the rest.
  const prefabIdNameMap = new Map([
    ...getPrefabNames(placements, pathNames),
    ...world.streams.flatMap(({ prefabs }) => prefabs.map(({ prefab, prefabId }) => [prefabId, prefab.name] as const)),
  ]);
  const originPrefabIds = new Set(
    world.streams.flatMap(({ prefabs }) =>
      prefabs.filter(({ prefab }) => prefab.pathId === world.origin.pathId).map(({ prefabId }) => prefabId),
    ),
  );
  const checkIsPlantPlacement = ({ prefabId }: WorldPlacement): boolean =>
    !originPrefabIds.has(prefabId) && checkIsPlantName(prefabIdNameMap.get(prefabId) || "");
  const plantPlacements = placements.filter((placement) => checkIsPlantPlacement(placement));
  return {
    origin,
    plants: Array.from(
      Map.groupBy(plantPlacements, ({ prefabId }) => prefabId),
      ([prefabId, places]) => ({ name: prefabIdNameMap.get(prefabId) || "", places }),
    ),
  };
};
