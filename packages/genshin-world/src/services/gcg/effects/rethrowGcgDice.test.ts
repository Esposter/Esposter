import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GCG_DIE_FACES } from "#src/services/gcg/constants";
import { rethrowGcgDice } from "#src/services/gcg/effects/rethrowGcgDice";
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

describe(rethrowGcgDice, () => {
  test("should throw the named dice again in turn and keep the faces of the others", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro, Element.Cryo]);
    rethrowGcgDice(side, [0, 2], createFaceRandom([1, 2]));
    expect(side.dice).toStrictEqual([takeOne(GCG_DIE_FACES, 1), Element.Pyro, takeOne(GCG_DIE_FACES, 2)]);
  });

  test("should leave every die as it is when no die is named", () => {
    expect.hasAssertions();
    const side = createSide([Element.Hydro, Element.Pyro]);
    rethrowGcgDice(side, [], createFaceRandom([]));
    expect(side.dice).toStrictEqual([Element.Hydro, Element.Pyro]);
  });
});
