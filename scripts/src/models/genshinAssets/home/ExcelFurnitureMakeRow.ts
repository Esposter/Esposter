// The fields read off one row of the game's furnishing-making table: the furnishing item it makes, the count one order
// Makes, the materials it takes with their counts, the seconds one unit takes, and the Trust EXP the first
// Making gives. A material slot the blueprint leaves empty has id zero
export interface ExcelFurnitureMakeRow {
  count: number;
  exp: number;
  furnitureItemID: number;
  makeTime: number;
  materialItems: { count: number; id: number }[];
}
