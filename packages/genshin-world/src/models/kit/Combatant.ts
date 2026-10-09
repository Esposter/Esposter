import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { Element } from "#src/models/Element";
import type { Kit } from "#src/models/kit/Kit";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

// A character as its hits are priced from it: its attributes, its id, its element if it has one, its kit, its level, its
// Ascension phase and constellation count, which its passives and constellations are gated on, and the deployed team's
// Elemental resonances, which its CRIT Rate Against a Frozen or Cryo enemy reads
export interface Combatant {
  ascension: number;
  attributes: CharacterAttributes;
  characterId: number;
  constellationCount: number;
  element?: Element;
  elementalResonances: ElementalResonance[];
  kit: Kit;
  level: number;
}
