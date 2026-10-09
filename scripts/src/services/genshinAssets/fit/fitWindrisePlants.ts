import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";
import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { GROUND_RADIUS } from "#src/services/genshinAssets/shared/constants";
import { checkIsPlantName } from "#src/services/genshinAssets/world/checkIsPlantName";
import { getPrefabNames } from "#src/services/genshinAssets/world/getPrefabNames";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { readStreamPlacements } from "#src/services/genshinAssets/world/readStreamPlacements";
import { readWorldOptions } from "#src/services/genshinAssets/world/readWorldOptions";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A plant prefab's name and every place it stands, in our region's axes, each with the scale its placement holds
interface FittedPlant {
  name: string;
  places: { position: GroundPoint; rotation: number; scale: number[] }[];
}
// Windrise's plants as stand-ins: every placement of its streams whose prefab is named a plant, within the ground's
// Radius of the oak's foot, each prefab's places in our region's axes round the origin with their scales. The oak is
// Left out, since its landmark already stands it, and so is any plant the streams place past the radius
export const fitWindrisePlants = async (): Promise<{ plants: FittedPlant[] }> => {
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
  const plants = Array.from(
    Map.groupBy(plantPlacements, ({ prefabId }) => prefabId),
    ([prefabId, prefabPlacements]) => ({
      name: prefabNames.get(prefabId) || "",
      places: prefabPlacements.map(({ position, rotation, scale: [scaleX, scaleY, scaleZ] }) => ({
        ...toRegionPlace({ position, rotation: toWorldQuaternion(rotation) }, origin),
        scale: [roundFitted(scaleX), roundFitted(scaleY), roundFitted(scaleZ)],
      })),
    }),
  );
  return { plants };
};
