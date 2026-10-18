import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { PYRO_SCORPION_ID, pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { takeGcgScriptedAction } from "#src/services/gcg/takeGcgScriptedAction";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TEST_RULE: GcgRule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
const EREMITE_ID = 2_303;
const HYDRO_ID = 2_101;

const createCharacter = (
  id: number,
  element: Element,
  options: { equipments?: GcgCharacterState["equipments"]; hp?: number } = {},
): GcgCharacterState => ({
  aura: GcgAura.None,
  character: { descriptionTextId: 2, element, hp: 10, id, maxEnergy: 3, nameTextId: 1, skills: [], weapon: "" },
  energy: 0,
  equipments: options.equipments ?? [],
  hp: options.hp ?? 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});
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

describe("takeGcgScriptedAction", () => {
  test("should use its active character's Technique when no card is in hand and no skill is listed", () => {
    expect.hasAssertions();

    const eremite = createCharacter(EREMITE_ID, Element.Pyro, {
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });
    const attacker = createSideState([eremite], [Element.Pyro, Element.Pyro]);
    const defender = createSideState([createCharacter(HYDRO_ID, Element.Hydro)]);
    const duel = createDuel(attacker, defender);

    const result = takeGcgScriptedAction(duel, 0);

    expect({ defenderHp: takeOne(defender.characters, 0).hp, result }).toStrictEqual({
      defenderHp: 8,
      result: GcgActionResult.Done,
    });
  });
});
