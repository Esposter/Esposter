// The fields read off one row of the game's artifact set table: the set, the equip affix that holds its name, the
// Reliquary pieces it is made of, and the counts of pieces its bonuses take
export interface ExcelReliquarySetRow {
  containsList: number[];
  equipAffixId: number;
  setId: number;
  setNeedNum: number[];
}
