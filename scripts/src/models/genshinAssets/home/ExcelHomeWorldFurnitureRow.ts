// The fields read off one row of the game's furnishing table: the furnishing's item id, and the load it takes up in its area,
// The first copy's `cost` and each further copy's `discountCost`. A row with no `cost` (a mansion's structure, a fish, a
// Virtual furnishing) holds no load in the table, so it is left out of the record
export interface ExcelHomeWorldFurnitureRow {
  cost?: number;
  discountCost?: number;
  id: number;
}
