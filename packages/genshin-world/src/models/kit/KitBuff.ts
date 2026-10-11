import type { Attribute } from "#src/models/character/Attribute";

// A stat bonus on a character, added to what its hits are priced from, for the seconds left of it. A source names the
// Effect that gives it when one effect gives the same attribute as another beside it, so each restarts only its own
export interface KitBuff {
  amount: number;
  attribute: Attribute;
  characterId: number;
  // Whether its character leaving the field ends it
  isEndedOnSwap?: true;
  kind: "buff";
  secondsRemaining: number;
  source?: string;
}
