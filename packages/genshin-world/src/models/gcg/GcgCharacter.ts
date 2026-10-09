import type { Element } from "#src/models/Element";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// A character card as the duel reads it: its id, its name and description text ids (the words are in the card game's
// Chunk), its element, its HP, its maximum energy, the kind of weapon it wields (the weapon tag the card names, or
// Nothing) and its skills
export interface GcgCharacter {
  descriptionTextId: number;
  element: Element;
  hp: number;
  id: number;
  maxEnergy: number;
  nameTextId: number;
  skills: GcgSkill[];
  weapon: string;
}
