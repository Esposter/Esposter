import type { StellarReactionType } from "#src/models/combat/StellarReactionType";

// A Stellar Linchpin user's Stellar Jubilee passive, which holds while the character is in the deployed team: the Stellar
// Reactions it enables for its party
export interface KitStellarJubilee {
  stellarReactionTypes: StellarReactionType[];
}
