import type { ExcelTransPointUnlockRow } from "#src/models/genshinAssets/transPoints/ExcelTransPointUnlockRow";

import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The open world's transport points the game's unlock table lists, published as one record of the transport points dataset
// Beside the rewards, sorted by point id. Only the open world's scene is kept, as the rewards are
export const buildTransPointUnlocks = (): Record<string, unknown> => {
  const unlocks = readExcelTable<ExcelTransPointUnlockRow>("TransPointUnlockConfigData")
    .filter(({ sceneId }) => sceneId === OPEN_WORLD_SCENE_ID)
    .map(({ pointId, sceneId }) => ({ pointId, sceneId }))
    .toSorted((firstRow, secondRow) => firstRow.pointId - secondRow.pointId);
  return { [`${GameDataset.TransPoints}/unlock`]: unlocks };
};
