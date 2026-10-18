import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { readMaterialSourceItemIdMap } from "#src/services/genshinAssets/materialSources/readMaterialSourceItemIdMap";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { GameDataset } from "genshin-world";

// Each region's material sources, the crystalflies the official map marks, as one slice of the material source dataset:
// Each point placed by the fit, its kind the id of the item it gives. The notes count each region's sources and what was
// Left out
export const buildMaterialSourcePlaces = async (): Promise<GameDataBuild> => {
  const labelItemIdMap = readMaterialSourceItemIdMap(await readInteractiveMapLabels());
  const placement = await placeFittedMapPoints(labelItemIdMap, "material-source");
  return buildMapPointSlices(GameDataset.MaterialSources, placement, "material sources");
};
