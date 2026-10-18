import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { Element } from "#src/models/Element";
import type { Kit } from "#src/models/kit/Kit";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";
import type { WeaponType } from "#src/models/weapon/WeaponType";

// A character as its hits are priced from it: its attributes, its id, its element if it has one, its catalogue region if
// Its association names one, its kit, its level, its Ascension phase and constellation count, which its passives and
// Constellations are gated on, the deployed team's Elemental resonances, which its CRIT Rate Against a Frozen or Cryo
// Enemy reads, and the kind of weapon it wields, none for a character the roster's table does not hold
export interface Combatant {
  ascension: number;
  attributes: CharacterAttributes;
  characterId: number;
  constellationCount: number;
  element?: Element;
  elementalResonances: ElementalResonance[];
  // The element each deployed member is drawn in, in the team's order, none for a member with none, which a status or a
  // Hit reads as the team stands. A combatant built with no team holds none
  deployedElements?: (Element | undefined)[];
  kit: Kit;
  level: number;
  regionId?: string;
  weaponType?: WeaponType;
}
