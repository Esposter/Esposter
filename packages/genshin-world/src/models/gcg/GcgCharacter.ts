import type { Element } from "#src/models/Element";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// A character card as the duel reads it: its id, its element, its HP, its maximum energy, the kind of weapon it wields
// (the weapon tag the card names, or nothing) and its skills
export interface GcgCharacter {
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  skills: GcgSkill[];
  weapon: string;
}
