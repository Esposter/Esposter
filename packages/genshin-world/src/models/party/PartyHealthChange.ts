// A change to a party member's HP as it took effect: the member, the share of its Max HP it gained, or lost as a negative
// Share, never past all of it or below none, the share of a heal that went past all of it, and the character whose kit
// Made the change, none for an enemy's strike, a drown or a heal that names no healer
export interface PartyHealthChange {
  characterId: number;
  healthShare: number;
  // Whether a kit refused the fall the change would have brought, leaving the member standing at the share it keeps
  isFallRefused?: boolean;
  overflowHealthShare: number;
  sourceCharacterId?: number;
}
