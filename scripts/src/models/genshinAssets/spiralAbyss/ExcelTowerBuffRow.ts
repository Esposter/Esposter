// The fields read off one row of the game's tower buff table: a Benediction's id and the text hash of its description
export interface ExcelTowerBuffRow {
  descTextMapHash: number;
  towerBuffId: number;
}
