// The fields read off one row of the game's Trust table: the level, the Trust EXP it takes to pass it, the companions it lets
// The realm hold, and the Realm Currency and Realm Bounty each store holds at that level
export interface ExcelHomeworldLevelRow {
  deployNpcCount: number;
  exp: number;
  homeCoinStoreLimit: number;
  homeFetterExpStoreLimit: number;
  level: number;
}
