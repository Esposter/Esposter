import type { Attribute } from "#src/models/character/Attribute";

// A stat bonus on a character, added to what its hits are priced from, for the seconds left of it
export interface KitBuff {
  amount: number;
  attribute: Attribute;
  characterId: number;
  kind: "buff";
  secondsRemaining: number;
}
