// What a prune of one account found and did: the objects no live lock names and that are past retention, how many the
// Batch deleted, and how many a write since the listing kept
export interface GameDataPruneResult {
  candidateCount: number;
  deletedCount: number;
  keptCount: number;
}
