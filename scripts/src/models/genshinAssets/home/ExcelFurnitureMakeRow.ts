// The fields read off one row of the game's furnishing-making table: the furnishing item it makes, the count one order makes,
// The materials it takes with their counts, the seconds one unit takes, and the Trust EXP the first making gives. A material
// Slot the blueprint leaves empty has id zero
export interface ExcelFurnitureMakeRow {
  count: number;
  exp: number;
  furnitureItemID: number;
  makeTime: number;
  materialItems: { count: number; id: number }[];
}
