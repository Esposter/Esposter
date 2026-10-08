import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { Element } from "#src/models/Element";
import type { Kit } from "#src/models/kit/Kit";

// A character as its hits are priced from it: its attributes, its id, its element if it has one, its kit and its level
export interface Combatant {
  attributes: CharacterAttributes;
  characterId: number;
  element?: Element;
  kit: Kit;
  level: number;
}
