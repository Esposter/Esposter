import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { describe } from "vitest";

export const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  dice: [],
  deckCardIds: [],
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
  onstages: [],
  summons: [],
  supports: [],
  usedCardIds: [],
  usedSkillIds: [],
});

describe.todo("createSideState");
