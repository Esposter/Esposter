// One row of the game's display item table, the picture an item is shown by. A strongbox's display item names its set as
// Its param, and its name's text id is "Artifact Strongbox: <set>"
export interface ExcelDisplayItemRow {
  displayType: string;
  id: number;
  nameTextMapHash: number;
  param: number;
}
