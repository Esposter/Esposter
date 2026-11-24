import type { GroundPoint } from "genshin-engine";

// A boss's Trounce Blossom, left where the boss fell: its place, and every time it was claimed, oldest first.
// None until it is.
// A normal boss's is claimed once until the boss comes back, and pays the boss's own drop.
// A weekly boss's is claimed once a week, its list growing across the weeks and the week's count read from it.
export interface BaseTrounceBlossom {
  claimedAts: Temporal.Instant[];
  place: GroundPoint;
}
