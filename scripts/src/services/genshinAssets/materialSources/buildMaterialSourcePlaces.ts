import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { readMaterialSourceItemIdMap } from "#src/services/genshinAssets/materialSources/readMaterialSourceItemIdMap";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { GameDataset } from "genshin-world";

// Each region's material sources, the critters the official map marks under Animals that give an item when picked, as
// One slice of the material source dataset: each point placed by the fit, its kind the id of the item it gives. The
// Notes name each critter group's join and each gather row left out, then count each region's sources and what was left
// Out
export const buildMaterialSourcePlaces = async (): Promise<GameDataBuild> => {
  const { kindMap, notes: joinNotes } = readMaterialSourceItemIdMap(await readInteractiveMapLabels());
  const { notes, objects } = await buildFittedMapPointSlices(
    GameDataset.MaterialSources,
    kindMap,
    "material-source",
    "material sources",
  );
  return { notes: [...joinNotes, ...notes], objects };
};
