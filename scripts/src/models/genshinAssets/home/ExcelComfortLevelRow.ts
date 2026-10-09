// The fields read off one row of the game's Adeptal Energy table: the level, the comfort a realm must reach for it, and the
// Realm Currency and Realm Bounty each rate produces at that level
export interface ExcelComfortLevelRow {
  comfort: number;
  companionshipExpProduceRate: number;
  homeCoinProduceRate: number;
  levelID: number;
}
