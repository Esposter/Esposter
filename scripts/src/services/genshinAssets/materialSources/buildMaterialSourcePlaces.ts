import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { readMaterialSourceItemIdMap } from "#src/services/genshinAssets/materialSources/readMaterialSourceItemIdMap";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { GameDataset } from "genshin-world";

// Each region's material sources, the crystalflies the official map marks, as one slice of the material source dataset:
// Each point placed by the fit, its kind the id of the item it gives. The notes count each region's sources and what was
// Left out
export const buildMaterialSourcePlaces = async (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.MaterialSources,
    readMaterialSourceItemIdMap(await readInteractiveMapLabels()),
    "material-source",
    "material sources",
  );
