// How a fish answers a lure within its reach: it flees a lure landed inside its flee range, turns toward a lure of the
// Bait it takes within its attract range, and otherwise ignores it
export enum FishReaction {
  Flees = "Flees",
  Ignores = "Ignores",
  Turns = "Turns",
}
