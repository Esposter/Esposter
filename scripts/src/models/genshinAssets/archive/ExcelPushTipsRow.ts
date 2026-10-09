// The fields read off one row of the game's push tips table: the push tip, its kind as the table spells it, and the text
// Hash of the title it shows
export interface ExcelPushTipsRow {
  pushTipsId: number;
  pushTipsType: string;
  titleTextMapHash: number;
}
