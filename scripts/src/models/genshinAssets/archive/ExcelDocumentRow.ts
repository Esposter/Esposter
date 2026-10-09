// The fields read off one row of the game's document table: its id, which is its item's id for a book, its kind as the
// Table spells it, and the ids of the quest texts its body is read from
export interface ExcelDocumentRow {
  documentType: string;
  id: number;
  questIDList: number[];
}
