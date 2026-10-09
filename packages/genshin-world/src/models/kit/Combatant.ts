import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { Element } from "#src/models/Element";
import type { Kit } from "#src/models/kit/Kit";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

// A character as its hits are priced from it: its attributes, its id, its element if it has one, its kit, its level and
// The deployed team's elemental resonances, which its CRIT Rate against a Frozen or Cryo enemy reads
export interface Combatant {
  attributes: CharacterAttributes;
  characterId: number;
  element?: Element;
  elementalResonances: ElementalResonance[];
  kit: Kit;
  level: number;
}
