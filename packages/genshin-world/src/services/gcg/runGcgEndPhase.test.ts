import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_BURNING_FLAME_ID } from "#src/services/gcg/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { runGcgEndPhase } from "#src/services/gcg/runGcgEndPhase";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";

const createSideState = (characters: GcgCharacterState[]): GcgSideState => ({
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

describe(runGcgEndPhase, () => {
  const FULL_HP = 10;

  test("should deal Burning Flame's one Pyro at the end phase, then take the summon off once its usage is spent", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule(GAME_DATA_LOCAL_BASE_URL);
    const attacker = createSideState([createGcgCharacterState({ character: { element: Element.Pyro } })]);
    attacker.summons.push({ cardId: GCG_BURNING_FLAME_ID, counter: 0, rounds: 0, usages: 1 });
    const duel: GcgDuel = {
      cardModules: GcgCardIdModuleMap,
      skillModules: GcgEffectNameSkillModuleMap,
      actingSideIndex: 0,
      firstSideIndex: 0,
      nextFirstSideIndex: 0,
      outcome: undefined,
      phase: GcgPhase.Action,
      random: () => 0,
      round: 1,
      rule,
      sides: [attacker, createSideState([createGcgCharacterState({ character: { element: Element.Hydro } })])],
      winnerSideIndex: undefined,
    };
    runGcgEndPhase(duel);

    expect({ hp: takeOne(takeOne(duel.sides, 1).characters, 0)?.hp, summons: attacker.summons }).toStrictEqual({
      hp: FULL_HP - 1,
      summons: [],
    });
  });
});
