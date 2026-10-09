// The fields read off one row of the game's forge table: its id, its forge type, its materials with their counts, the Mora
// It costs, the seconds one item takes, the forge points one item counts toward the day's cap, the most one queue holds,
// The Adventure Rank it needs, its result and the count it makes, and whether the blacksmith shows it from the start. A
// Material slot the recipe leaves empty has id zero, and a result of id zero is a drop table's
export interface ExcelForgeRow {
  forgePoint: number;
  forgeTime: number;
  forgeType: number;
  id: number;
  isDefaultShow: boolean;
  materialItems: { count: number; id: number }[];
  playerLevel: number;
  queueNum: number;
  resultItemCount: number;
  resultItemId: number;
  scoinCost: number;
}
