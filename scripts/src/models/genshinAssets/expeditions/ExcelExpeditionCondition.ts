// One condition a place of the game's expedition table opens by, as the dump holds it: its kind as the table spells it,
// And its two values. A point's first value is the scene point's id and its second the scene's, a quest's the quest's id,
// And a rank's the Adventure Rank it opens at. The dump scrambles these field names each patch, so a reader reads them
// By the condition's kind and the value it holds
export interface ExcelExpeditionCondition {
  CIMKGJIONHO: number;
  PCPMLMPDAFH: number;
  type: string;
}
