import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { tossUp } from "#src/services/gcg/cards/tossUp";
import { GCG_DIE_FACES } from "#src/services/gcg/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// A random source that rolls the given die face in turn, each as the middle of its slice of the faces
const createFaceRandom = (faceIndices: number[]): (() => number) => {
  const values = faceIndices.map((faceIndex) => (faceIndex + 0.5) / GCG_DIE_FACES.length);
  return () => values.shift() ?? 0;
};

const createSide = (dice: GcgSideState["dice"]): GcgSideState => ({
  activeIndex: 0,
  cards: [],
  characters: [],
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

const createDuel = (side: GcgSideState, random: () => number): GcgDuel => ({
  actingSideIndex: 0,
  firstSideIndex: 0,
  nextFirstSideIndex: 0,
  phase: GcgPhase.Action,
  random,
  round: 1,
  rule: { drawCount: 2, handCardLimit: 10, reactions: [] },
  sides: [side, createSide([])],
});

const playTossUp = (side: GcgSideState, random: () => number, choice?: GcgPlayChoice): void => {
  const context: GcgEffectContext = { duel: createDuel(side, random), sideIndex: 0 };
  tossUp.play?.(context, undefined, choice);
};

describe(tossUp, () => {
  test("should reroll the dice of each selection in turn, through the duel's random source", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro, Element.Cryo]);
    playTossUp(side, createFaceRandom([1, 2]), { rerollDiceIndices: [[0], [2]] });
    expect(side.dice).toStrictEqual([takeOne(GCG_DIE_FACES, 1), Element.Pyro, takeOne(GCG_DIE_FACES, 2)]);
  });

  test("should reroll at most two selections", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro, Element.Cryo]);
    playTossUp(side, createFaceRandom([1, 2, 3]), { rerollDiceIndices: [[0], [1], [2]] });
    expect(side.dice).toStrictEqual([takeOne(GCG_DIE_FACES, 1), takeOne(GCG_DIE_FACES, 2), Element.Cryo]);
  });

  test("should pass over a selection that names a die the side does not have, and not count it", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro, Element.Cryo]);
    playTossUp(side, createFaceRandom([1, 2]), { rerollDiceIndices: [[5], [0], [1]] });
    expect(side.dice).toStrictEqual([takeOne(GCG_DIE_FACES, 1), takeOne(GCG_DIE_FACES, 2), Element.Cryo]);
  });

  test("should leave every die as it is when it is played without a choice", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro]);
    playTossUp(side, createFaceRandom([]));
    expect(side.dice).toStrictEqual([Element.Hydro, Element.Pyro]);
  });
});
