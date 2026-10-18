// One fishing pool of the game's pool table: the city it is fished in, the fish it leaves out of its stocks, how many fish
// A point holds, and the stocks it draws from, day and night, as the ids of the stock table's rows
export interface ExcelFishPoolRow {
  cityId: number;
  excludeFish: number[];
  id: number;
  maxNum: number;
  stockList: number[];
}
