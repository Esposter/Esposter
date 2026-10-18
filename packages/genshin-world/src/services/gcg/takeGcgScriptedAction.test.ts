import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeGcgScriptedAction } from "#src/services/gcg/takeGcgScriptedAction";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const EREMITE_ID = 2_303;
const HYDRO_ID = 2_101;

const createSideState = (characters: GcgCharacterState[], dice: Element[] = []): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters,
  deckCardIds: [],
  dice,
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
const createDuel = (attacker: GcgSideState, defender: GcgSideState): GcgDuel => ({
  cardModules: GcgCardIdModuleMap,
  skillModules: GcgEffectNameSkillModuleMap,
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides: [attacker, defender],
  winnerSideIndex: undefined,
});

describe(takeGcgScriptedAction, () => {
  test("should use its active character's Technique when no card is in hand and no skill is listed", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { id: EREMITE_ID, element: Element.Pyro },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], [Element.Pyro, Element.Pyro]);
    const defender = createSideState([
      createGcgCharacterState({ character: { id: HYDRO_ID, element: Element.Hydro } }),
    ]);
    const duel = createDuel(attacker, defender);

    const result = takeGcgScriptedAction(duel, 0);

    expect({ defenderHp: takeOne(defender.characters, 0).hp, result }).toStrictEqual({
      defenderHp: 8,
      result: GcgActionResult.Done,
    });
  });
});
