import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { toShrineKeySources } from "#src/services/genshinAssets/puzzles/toShrineKeySources";
import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { MAIN_QUEST_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";

// The Shrine of Depths keys the dump's quest rewards name, each filed under its region, from the dump's tables
export const buildShrineKeySources = (): GameDataBuild =>
  toShrineKeySources({
    englishTextMap: readTextMap(GameLanguage.English),
    materials: readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
    quests: readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME),
    rewards: readRewardMap(),
  });
