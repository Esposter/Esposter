import type { GroundPoint } from "genshin-engine";

// A normal boss's Trounce Blossom, left where the boss fell: its place, the boss's own drop it pays, and when it was
// Claimed, none until then
export interface TrounceBlossom {
  claimedAt?: Temporal.Instant;
  place: GroundPoint;
  uniqueDropId: number;
}
