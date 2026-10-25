import type { ArrangementFamily } from "#src/models/genshinAssets/scene/ArrangementFamily";

import { createPlantFamily } from "#src/services/genshinAssets/scene/createPlantFamily";

export const WindrisePlantArrangementFamilies: ArrangementFamily[] = [
  createPlantFamily("Grass", "Grass"),
  createPlantFamily("Trees", "TreeStump"),
];
