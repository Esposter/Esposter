import type { Element } from "#src/models/Element";
import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import type { GcgPreparedSkill } from "#src/models/gcg/GcgPreparedSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

// One side of a duel: its characters and which is active, its dice this round, its draw pile and hand by card id, the
// Card ids its deck was built with, copies and all, and the definitions of its deck's cards, its supports, summons and
// Onstage cards on the field, the cards and skills it has used this round, and the flags of what it has done this
// Round: prepared, rolled, declared its round's end, or owes a replacement for a defeated active character
export interface GcgSideState {
  activeIndex: number;
  cards: GcgCard[];
  characters: GcgCharacterState[];
  deckCardIds: number[];
  dice: (Element | GcgDieFace)[];
  drawPile: number[];
  // The rerolls a card grants the side past its one in the roll phase, each spent by a reroll of named dice
  extraRerolls?: number;
  hand: number[];
  // Whether the side's Normal Attacks this round are Charged Attacks, which they are when its Elemental Dice were even
  // In number before its Action Phase
  hasChargedAttack?: boolean;
  hasDeclaredEnd: boolean;
  hasDefeatedCharacter?: boolean;
  hasPrepared: boolean;
  hasRolled: boolean;
  isReplacementPending: boolean;
  onstages: GcgZoneCard[];
  // The skills prepared for this side's next turn, each run by the character that prepared it
  preparedSkills?: GcgPreparedSkill[];
  summons: GcgZoneCard[];
  supports: GcgZoneCard[];
  usedCardIds: number[];
  // The ids of the effects that run once a Match rather than once a Round, each recorded once it has run
  usedMatchIds?: number[];
  usedSkillIds: number[];
}
