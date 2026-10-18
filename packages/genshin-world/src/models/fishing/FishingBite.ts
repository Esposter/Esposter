// A bite under way: how many seconds the fish nibbles for before it bites, drawn from its feeler range when it turns to
// The lure, and how many seconds have passed since it turned
export interface FishingBite {
  elapsedSeconds: number;
  nibbleSeconds: number;
}
