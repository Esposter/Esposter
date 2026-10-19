import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeGcgScriptedAction } from "#src/services/gcg/takeGcgScriptedAction";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);

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
  actingSideIndex: 0,
  cardModules: GcgCardIdModuleMap,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  outcome: undefined,
  phase: GcgPhase.Action,
  random: () => 0,
  round: 1,
  rule: TEST_RULE,
  sides: [attacker, defender],
  skillModules: GcgEffectNameSkillModuleMap,
  winnerSideIndex: undefined,
});

describe(takeGcgScriptedAction, () => {
  const EREMITE_ID = 2303;
  const HYDRO_ID = 2101;

  test("should use its active character's Technique when no card is in hand and no skill is listed", () => {
    expect.hasAssertions();

    const eremite = createGcgCharacterState({
      character: { element: Element.Pyro, id: EREMITE_ID },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], [Element.Pyro, Element.Pyro]);
    const defender = createSideState([
      createGcgCharacterState({ character: { element: Element.Hydro, id: HYDRO_ID } }),
    ]);
    const duel = createDuel(attacker, defender);

    const result = takeGcgScriptedAction(duel, 0);

    expect({ defenderHp: takeOne(defender.characters, 0).hp, result }).toStrictEqual({
      defenderHp: 8,
      result: GcgActionResult.Done,
    });
  });
});
