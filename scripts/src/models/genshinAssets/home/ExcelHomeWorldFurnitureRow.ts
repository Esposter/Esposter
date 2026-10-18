// The fields read off one row of the game's furnishing table: the furnishing's item id, and the load it takes up in its area,
// Zero for a furnishing that takes none
export interface ExcelHomeWorldFurnitureRow {
  cost: number;
  id: number;
}
