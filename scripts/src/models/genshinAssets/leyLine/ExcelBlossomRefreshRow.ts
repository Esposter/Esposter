import type { ExcelBlossomRefreshCondition } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshCondition";
import type { ExcelBlossomRefreshReward } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshReward";

// One blossom refresh of the game's table: the kind of blossom it refreshes, the city it stands in, the conditions it
// Opens by and the reward each World Level's claim gives, the dump's own names for those lists kept
export interface ExcelBlossomRefreshRow {
  cityId: number;
  KNHAALNEMLL: ExcelBlossomRefreshCondition[];
  OFGHJMOLMNA: ExcelBlossomRefreshReward[];
  refreshType: string;
}
