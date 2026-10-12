import type { Attribute } from "#src/models/character/Attribute";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

// A stat bonus on a character, added to what its hits are priced from, for the seconds left of it. A source names the
// Effect that gives it when one effect gives the same attribute as another beside it, so each restarts only its own
export interface KitBuff extends KitSwapEndable {
  amount: number;
  attribute: Attribute;
  characterId: number;
  kind: "buff";
  secondsRemaining: number;
  source?: string;
}
