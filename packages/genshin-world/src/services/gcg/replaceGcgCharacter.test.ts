import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { replaceGcgCharacter } from "#src/services/gcg/replaceGcgCharacter";
import { describe, expect, test } from "vitest";

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  deckCardIds: [],
  dice: [],
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

const createDuel = (sides: [GcgSideState, GcgSideState]): GcgDuel => ({
  actingSideIndex: 0,
  cardModules: GcgCardIdModuleMap,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides,
  skillModules: GcgEffectNameSkillModuleMap,
  winnerSideIndex: undefined,
});

describe(replaceGcgCharacter, () => {
  test("should leave the replacement unflagged, since a defeat's replacement is no switch", () => {
    expect.hasAssertions();

    const side = createSideState([createGcgCharacterState(), createGcgCharacterState()]);
    side.isReplacementPending = true;
    const duel = createDuel([side, createSideState([createGcgCharacterState()])]);

    expect(replaceGcgCharacter(duel, 0, 1)).toBe(GcgActionResult.Done);
    expect({
      activeIndex: side.activeIndex,
      flags: side.characters.map(({ isSwitchedIn }) => isSwitchedIn),
    }).toStrictEqual({ activeIndex: 1, flags: [undefined, undefined] });
  });
});
