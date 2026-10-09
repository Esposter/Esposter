// One duel of the card game's game table, as the dump names its plain fields: the deck the game names for the player,
// The deck its opponent plays, and the rule it runs
export interface ExcelGcgGameRow {
  cardGroupId: number;
  enemyCardGroupId: number;
  id: number;
  ruleId: number;
}
