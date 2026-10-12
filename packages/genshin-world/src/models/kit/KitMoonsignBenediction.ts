import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { Combatant } from "#src/models/kit/Combatant";

// A Moonsign character's Benediction, which holds while it is in the deployed team: the reactions of the party's it
// Turns Lunar, none for a character that only counts toward the Moonsign, and the Base DMG Bonus it adds to the party's
// Lunar damage of those reactions, given the character as it stands, if it adds one
export interface KitMoonsignBenediction {
  getBaseDamageBonus?: (combatant: Combatant) => number;
  lunarReactionTypes: LunarReactionType[];
}
