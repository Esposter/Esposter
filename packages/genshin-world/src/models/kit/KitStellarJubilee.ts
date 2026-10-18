import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Combatant } from "#src/models/kit/Combatant";

// A Stellar Linchpin user's Stellar Jubilee passive, which holds while the character is in the deployed team: the Stellar
// Reactions it enables for its party, and the Base DMG Bonus it adds to the party's Stellar damage, given the character as
// It stands, if it adds one
export interface KitStellarJubilee {
  getBaseDamageBonus?: (combatant: Combatant) => number;
  stellarReactionTypes: StellarReactionType[];
}
