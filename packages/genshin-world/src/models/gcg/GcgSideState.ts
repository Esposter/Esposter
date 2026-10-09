import type { Element } from "#src/models/Element";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";

// One side of a duel: its characters and which is active, its dice this round, its draw pile and hand by card id, and the
// Flags of what it has done this round: prepared, rolled, declared its round's end, or owes a replacement for a defeated
// Active character
export interface GcgSideState {
  activeIndex: number;
  characters: GcgCharacterState[];
  dice: (Element | GcgDieFace)[];
  drawPile: number[];
  hand: number[];
  hasDeclaredEnd: boolean;
  hasPrepared: boolean;
  hasRolled: boolean;
  isReplacementPending: boolean;
}
