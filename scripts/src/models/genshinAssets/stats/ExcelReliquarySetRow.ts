// An artifact set: the piece counts its bonuses come at, and the affix holding each bonus, zero where it holds none
export interface ExcelReliquarySetRow {
  equipAffixId: number;
  setId: number;
  setNeedNum: number[];
}
