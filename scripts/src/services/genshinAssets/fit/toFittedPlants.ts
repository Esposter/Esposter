import type { FittedPlant } from "#src/models/genshinAssets/fit/FittedPlant";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";

// A component's plants as stand-ins: each prefab's places in our region's axes round the origin with their scales
export const toFittedPlants = (
  plants: readonly { name: string; places: readonly WorldPlacement[] }[],
  origin: [number, number, number],
): FittedPlant[] =>
  plants.map(({ name, places }) => ({
    name,
    places: places.map(({ position, rotation, scale: [scaleX, scaleY, scaleZ] }) => ({
      ...toRegionPlace({ position, rotation: toWorldQuaternion(rotation) }, origin),
      scale: [roundFitted(scaleX), roundFitted(scaleY), roundFitted(scaleZ)],
    })),
  }));
