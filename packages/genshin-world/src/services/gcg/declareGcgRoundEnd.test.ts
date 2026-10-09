import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgOutcome } from "#src/models/gcg/GcgOutcome";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { createSeededRandom } from "genshin-engine";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { GCG_ROUND_LIMIT } from "#src/services/gcg/constants";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { describe, expect, test } from "vitest";

const createCharacterState = (): GcgCharacterState => ({
  aura: GcgAura.None,
  character: { element: Element.Pyro, hp: 10, id: 1, maxEnergy: 3, skills: [] },
  energy: 0,
  hp: 10,
  isFrozen: false,
  shield: 0,
});

describe(declareGcgRoundEnd, () => {
  const SEED = 7;
  const HAND_CARD_COUNT = 1;
  const DRAW_PILE_CARD_IDS = [201, 202, 203];
  const createSideState = (): GcgSideState => ({
    activeIndex: 0,
    characters: [createCharacterState()],
    dice: [Element.Pyro],
    drawPile: [...DRAW_PILE_CARD_IDS],
    hand: [101],
    hasDeclaredEnd: false,
    hasPrepared: true,
    hasRolled: true,
    isReplacementPending: false,
  });
  const createDuel = (round = 1): GcgDuel => ({
    actingSideIndex: 0,
    firstSideIndex: 0,
    nextFirstSideIndex: 0,
    outcome: undefined,
    phase: GcgPhase.Action,
    round,
    sides: [createSideState(), createSideState()],
    winnerSideIndex: undefined,
  });

  test("should pass the turn to the side still acting, and make the first to declare the next round's first", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel();
    const result = declareGcgRoundEnd(duel, 0, rule, createSeededRandom(SEED));

    expect({
      actingSideIndex: duel.actingSideIndex,
      firstSideIndex: duel.firstSideIndex,
      nextFirstSideIndex: duel.nextFirstSideIndex,
      phase: duel.phase,
      result,
    }).toStrictEqual({
      actingSideIndex: 1,
      firstSideIndex: 0,
      nextFirstSideIndex: 0,
      phase: GcgPhase.Action,
      result: GcgActionResult.Done,
    });
  });

  test("should close the round once both sides declare, drawing two cards each and rolling the next round", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel();
    declareGcgRoundEnd(duel, 0, rule, createSeededRandom(SEED));
    declareGcgRoundEnd(duel, 1, rule, createSeededRandom(SEED));

    expect({
      handSizes: duel.sides.map(({ hand }) => hand.length),
      phase: duel.phase,
      round: duel.round,
    }).toStrictEqual({ handSizes: [HAND_CARD_COUNT + 2, HAND_CARD_COUNT + 2], phase: GcgPhase.Roll, round: 2 });
  });

  test("should concede the duel to both sides once the fifteenth round's end phase closes", async () => {
    expect.hasAssertions();

    const rule = await readGcgStandardRule();
    const duel = createDuel(GCG_ROUND_LIMIT);
    declareGcgRoundEnd(duel, 0, rule, createSeededRandom(SEED));
    declareGcgRoundEnd(duel, 1, rule, createSeededRandom(SEED));

    expect({ outcome: duel.outcome, phase: duel.phase, winnerSideIndex: duel.winnerSideIndex }).toStrictEqual({
      outcome: GcgOutcome.Conceded,
      phase: GcgPhase.Ended,
      winnerSideIndex: undefined,
    });
  });
});
