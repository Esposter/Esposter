import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { switchGcgActiveCharacter } from "#src/services/gcg/switchGcgActiveCharacter";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

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
  rule: TEST_RULE,
  sides,
  skillModules: GcgEffectNameSkillModuleMap,
  winnerSideIndex: undefined,
});

describe(switchGcgActiveCharacter, () => {
  test("should make the character at the index the active one, flagged as switched in, and leave the others unflagged", () => {
    expect.hasAssertions();

    const duel = createDuel([
      createSideState([createGcgCharacterState(), createGcgCharacterState()]),
      createSideState([]),
    ]);
    switchGcgActiveCharacter(duel, 0, 1);

    const side = takeOne(duel.sides, 0);
    expect({
      activeIndex: side.activeIndex,
      flags: side.characters.map(({ isSwitchedIn }) => isSwitchedIn),
    }).toStrictEqual({ activeIndex: 1, flags: [undefined, true] });
  });
});
