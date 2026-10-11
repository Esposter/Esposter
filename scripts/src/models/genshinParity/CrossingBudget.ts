// The figures a screen's crossing is held to, from the move to its settling: the requests, the game data bytes they
// Fetched, and the tiles rebuilt over what arrived
export interface CrossingBudget {
  gameDataBytes: number;
  requests: number;
  tileCount: number;
}
