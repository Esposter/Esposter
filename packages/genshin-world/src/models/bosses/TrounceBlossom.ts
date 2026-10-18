import type { GroundPoint } from "genshin-engine";

// A normal boss's Trounce Blossom, left where the boss fell: its place, and when it was claimed, none until then
export interface TrounceBlossom {
  claimedAt?: Temporal.ZonedDateTime;
  place: GroundPoint;
}
