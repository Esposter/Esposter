// The fields read off one row of the game's tower level table: a chamber's id and its place in its level group, and the
// Conditions its three stars are read by, each a kind and its arguments, the last of which is the mark
export interface ExcelTowerLevelRow {
  conds: { argumentList: number[]; towerCondType: string }[];
  levelGroupId: number;
  levelId: number;
  levelIndex: number;
}
