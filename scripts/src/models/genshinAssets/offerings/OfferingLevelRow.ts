// One item a level takes or pays, as its item and how many of it
export interface OfferingItemCount {
  itemCount: number;
  itemId: number;
}

// What a level pays: its fixed rewards, or a pool of sets it draws one set from. The pool's sets are paid once each across
// The offering's levels, in a random order, as the Gift of Amrita's wiki page describes
export type OfferingLevelReward =
  | { kind: "fixed"; rewards: OfferingItemCount[] }
  | { kind: "pool"; sets: OfferingItemCount[][] };

// One level of an offering as the world reads it: the items it takes off the held counts, each as its item and how many
// Of it, and what it pays. A level that names no item takes none
export interface OfferingLevelRow {
  items: OfferingItemCount[];
  level: number;
  reward: OfferingLevelReward;
}
