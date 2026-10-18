import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Element } from "#src/models/Element";

// A change to a party member's HP as it took effect: the member, the share of its Max HP it gained, or lost as a negative
// Share, never past all of it or below none, the share of a heal that went past all of it, the character whose kit
// Made the change, none for an enemy's strike, a drown or a heal that names no healer, and the member's share of its
// Max HP before the change and after it
export interface PartyHealthChange {
  // The share of the heal a Bond of Life took before it restored the HP, none when no Bond of Life was standing
  bondOfLifeShare: number;
  // The attack tag of the attack whose party heal made the change, none for a heal a kit makes outside an attack
  attackTag?: AttackTag;
  characterId: number;
  // The element of the attack that caused the change, none for a drain, a drown, a heal or an attack with no element
  element?: Element;
  healthShare: number;
  healthShareAfter: number;
  healthShareBefore: number;
  // Whether a kit refused the fall the change would have brought, leaving the member standing at the share it keeps
  isFallRefused?: boolean;
  overflowHealthShare: number;
  sourceCharacterId?: number;
}
