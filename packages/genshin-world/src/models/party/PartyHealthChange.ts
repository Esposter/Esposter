import type { Element } from "#src/models/Element";

// A change to a party member's HP as it took effect: the member, the share of its Max HP it gained, or lost as a negative
// Share, never past all of it or below none, the share of a heal that went past all of it, and the character whose kit
// Made the change, none for an enemy's strike, a drown or a heal that names no healer
export interface PartyHealthChange {
  // The share of the heal a Bond of Life took before it restored the HP, none when no Bond of Life was standing
  bondOfLifeShare: number;
  characterId: number;
  // The element of the attack that caused the change, none for a drain, a drown, a heal or an attack with no element
  element?: Element;
  healthShare: number;
  // Whether a kit refused the fall the change would have brought, leaving the member standing at the share it keeps
  isFallRefused: boolean;
  overflowHealthShare: number;
  sourceCharacterId?: number;
}
