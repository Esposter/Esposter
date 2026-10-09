import type { Element } from "#src/models/Element";
import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// One side of a duel: its characters and which is active, its dice this round, its draw pile and hand by card id, the
// Definitions of its deck's cards, its supports, summons and onstage cards on the field, the cards and skills it has used
// This round, and the flags of what it has done this round: prepared, rolled, declared its round's end, or owes a
// Replacement for a defeated active character
export interface GcgSideState {
  activeIndex: number;
  cards: GcgCard[];
  characters: GcgCharacterState[];
  dice: (Element | GcgDieFace)[];
  drawPile: number[];
  hand: number[];
  hasDeclaredEnd: boolean;
  hasPrepared: boolean;
  hasRolled: boolean;
  isReplacementPending: boolean;
  onstages: GcgZoneCard[];
  summons: GcgZoneCard[];
  supports: GcgZoneCard[];
  usedCardIds: number[];
  usedSkillIds: number[];
}
