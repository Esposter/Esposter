// One level's row of the game's monster curve table: each curve's multiplier at that level. The dump scrambles the
// Multiplier's field name each patch, and a multiplier of zero is written with no field, restored by the table reader
export interface MonsterCurveRow {
  curveInfos: { GGKIEIJLCJJ: number; type: string }[];
  level: number;
}
