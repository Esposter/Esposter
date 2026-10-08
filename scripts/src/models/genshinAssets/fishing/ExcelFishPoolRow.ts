// One fishing pool of the game's pool table: the city it is fished in, how many fish a point holds, and the stocks it
// Draws from, day and night, as the ids of the stock table's rows
export interface ExcelFishPoolRow {
  cityId: number;
  id: number;
  maxNum: number;
  stockList: number[];
}
