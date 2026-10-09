import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";
import type { AdventureRankLock } from "#src/models/adventureRank/AdventureRankLock";
import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";

// The game's rank table, lock table and world level table, read as the world opens: the EXP each rank takes, the rank
// Cap and unlock each World Level sets, and the level each World Level raises the enemies to
export interface AdventureRankTables {
  levels: AdventureRankLevel[];
  locks: AdventureRankLock[];
  worldLevelRows: WorldLevelRow[];
}
