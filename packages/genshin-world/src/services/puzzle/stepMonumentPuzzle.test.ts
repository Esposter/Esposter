import type { MonumentPuzzle } from "#src/models/puzzle/MonumentPuzzle";

import { Element } from "#src/models/Element";
import { createMonument } from "#src/services/puzzle/createMonument.test";
import { stepMonumentPuzzle } from "#src/services/puzzle/stepMonumentPuzzle";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { describe, expect, test } from "vitest";

describe(stepMonumentPuzzle, () => {
  test("lighting every monument together solves the puzzle", () => {
    expect.hasAssertions();

    const lastMonument = createMonument(false);
    const puzzle: MonumentPuzzle = { isSolved: false, monuments: [createMonument(true), lastMonument] };
    stepMonumentPuzzle(puzzle);
    const isSolvedBeforeLast = puzzle.isSolved;
    strikeElementalMonument(lastMonument, Element.Pyro, 1);
    stepMonumentPuzzle(puzzle);

    expect({ isSolvedAfterLast: puzzle.isSolved, isSolvedBeforeLast }).toStrictEqual({
      isSolvedAfterLast: true,
      isSolvedBeforeLast: false,
    });
  });

  test("a monument going out first leaves the puzzle unsolved", () => {
    expect.hasAssertions();

    const firstMonument = createMonument(true);
    const lastMonument = createMonument(false);
    const puzzle: MonumentPuzzle = { isSolved: false, monuments: [firstMonument, createMonument(true), lastMonument] };
    firstMonument.isLit = false;
    strikeElementalMonument(lastMonument, Element.Pyro, 1);
    stepMonumentPuzzle(puzzle);

    expect(puzzle.isSolved).toBe(false);
  });

  test("a solved puzzle stays solved", () => {
    expect.hasAssertions();

    const monument = createMonument(true);
    const puzzle: MonumentPuzzle = { isSolved: false, monuments: [monument] };
    stepMonumentPuzzle(puzzle);
    const isSolvedBeforeGoingOut = puzzle.isSolved;
    monument.isLit = false;
    stepMonumentPuzzle(puzzle);

    expect({ isSolvedAfterGoingOut: puzzle.isSolved, isSolvedBeforeGoingOut }).toStrictEqual({
      isSolvedAfterGoingOut: true,
      isSolvedBeforeGoingOut: true,
    });
  });
});
