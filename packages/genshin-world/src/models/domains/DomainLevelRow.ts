import type { DomainLevelState } from "#src/models/domains/DomainLevelState";

// Each level of a domain as its entry screen lists it: its dungeon, its enemies' level, the Adventure Rank it asks for and
// The state the player finds it in
export interface DomainLevelRow {
  dungeonId: number;
  enemyLevel: number;
  // The Adventure Rank the level asks for: its recommended rank, or the rank its kind opens at where that is higher
  requiredRank: number;
  state: DomainLevelState;
}
