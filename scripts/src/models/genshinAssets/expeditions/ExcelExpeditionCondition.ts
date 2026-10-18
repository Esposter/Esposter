// One condition a place of the game's expedition table opens by, as the dump holds it: its kind as the table spells it,
// And its two values. A point's first value is the scene point's id and its second the scene's, a quest's the quest's id,
// And a rank's the Adventure Rank it opens at. The dump scrambles these field names each patch, so a reader reads them
// By the condition's kind and the value it holds. The table's default condition, the rank at zero, is written with no fields,
// So each one may be absent and reads as its default
export interface ExcelExpeditionCondition {
  AOCOBPPBOOL?: number;
  OLDPDBIPNHD?: number;
  type?: string;
}
