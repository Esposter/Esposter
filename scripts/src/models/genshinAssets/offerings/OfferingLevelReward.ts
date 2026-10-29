import type { OfferingItemCount } from "#src/models/genshinAssets/offerings/OfferingItemCount";

// What a level pays: its fixed rewards, or a pool of sets it draws one set from. The pool's sets are paid once each across
// The offering's levels, in a random order, as the Gift of Amrita's wiki page describes
export type OfferingLevelReward =
  | { kind: "fixed"; rewards: OfferingItemCount[] }
  | { kind: "pool"; sets: OfferingItemCount[][] };
