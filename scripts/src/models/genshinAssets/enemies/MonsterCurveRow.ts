// One level's row of the game's monster curve table: each curve's multiplier at that level
export interface MonsterCurveRow {
  curveInfos: { type: string; value: number }[];
  level: number;
}
