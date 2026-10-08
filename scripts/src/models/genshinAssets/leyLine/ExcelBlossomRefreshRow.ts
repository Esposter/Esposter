import type { ExcelBlossomRefreshCondition } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshCondition";

// One blossom refresh of the game's table: the kind of blossom it refreshes, the city it stands in and the conditions
// It opens by, the dump's own name for that list kept
export interface ExcelBlossomRefreshRow {
  cityId: number;
  HGBNAGMEAFI: ExcelBlossomRefreshCondition[];
  refreshType: string;
}
