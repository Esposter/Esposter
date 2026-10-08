import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

import { Element } from "#src/models/Element";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { checkIsMonumentPuzzleSolved } from "#src/services/puzzle/checkIsMonumentPuzzleSolved";
import { describe, expect, test } from "vitest";

const createMonument = (isLit: boolean): ElementalMonument => ({
  element: Element.Pyro,
  elementalState: createElementalState(),
  isLit,
  isTimed: false,
  litSeconds: 0,
});

describe(checkIsMonumentPuzzleSolved, () => {
  test("is solved once every monument of it is lit together", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([createMonument(true), createMonument(true)])).toBe(true);
  });

  test("is not solved while one of its monuments stays dark", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([createMonument(true), createMonument(false)])).toBe(false);
  });

  test("is not solved by no monuments at all", () => {
    expect.hasAssertions();

    expect(checkIsMonumentPuzzleSolved([])).toBe(false);
  });
});
