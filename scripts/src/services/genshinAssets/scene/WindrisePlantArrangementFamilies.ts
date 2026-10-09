import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";
import type { Vector } from "#src/models/shared/Vector";

import { readWindrisePlantPlacements } from "#src/services/genshinAssets/fit/readWindrisePlantPlacements";
import { toRegionPlace } from "#src/services/genshinAssets/fit/toRegionPlace";
import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";
import { toWorldQuaternion } from "#src/services/genshinAssets/world/toWorldQuaternion";

// Windrise's fitted plants: each prefab with its places in our region's axes, as `windrise/plants.json` holds them
interface FittedPlants {
  plants: { name: string; places: { position: { x: number; z: number } }[] }[];
}

// A family of Windrise's plants, every prefab whose name holds the part: its places as the streams record them, in our
// Region's axes on the ground's plane, against the fitted places drawn for it. A fitted file that drifts from the records
// It was fitted from shows as a distance
const createPlantFamily = (name: string, namePart: string): ArrangementFamily => ({
  name,
  readExpected: async () => {
    const { origin, plants } = await readWindrisePlantPlacements();
    return plants
      .filter((plant) => plant.name.includes(namePart))
      .flatMap(({ places }) =>
        places.map(({ position, rotation }): Vector => {
          const { position: region } = toRegionPlace({ position, rotation: toWorldQuaternion(rotation) }, origin);
          return [region.x, 0, region.z];
        }),
      );
  },
  readPositions: async () =>
    (await readWorldData<FittedPlants>("windrise/plants.json")).plants
      .filter((plant) => plant.name.includes(namePart))
      .flatMap(({ places }) => places.map(({ position: { x, z } }): Vector => [x, 0, z])),
});

export const WindrisePlantArrangementFamilies: ArrangementFamily[] = [
  createPlantFamily("Grass", "Grass"),
  createPlantFamily("Trees", "TreeStump"),
];
