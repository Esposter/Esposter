import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgDieFace } from "#src/models/gcg/GcgDieFace";
import { payGcgCost } from "#src/services/gcg/payGcgCost";
import { describe, expect, test } from "vitest";

const createSideState = (dice: (Element | GcgDieFace)[]): GcgSideState => ({
  activeIndex: 0,
  characters: [],
  dice,
  drawPile: [],
  hand: [],
  hasDeclaredEnd: false,
  hasPrepared: true,
  hasRolled: true,
  isReplacementPending: false,
});

describe(payGcgCost, () => {
  const MATCHING_ELEMENT = Element.Hydro;

  test("should pay dice of an element with an Omni die once its own face runs out, and remove the dice paid", () => {
    expect.hasAssertions();

    const side = createSideState([Element.Pyro, GcgDieFace.Omni, Element.Hydro, Element.Cryo]);
    const costs: GcgCost[] = [{ count: 2, element: Element.Pyro, kind: GcgCostKind.Dice }];

    expect({ dice: side.dice, isPaid: payGcgCost(side, MATCHING_ELEMENT, costs, [0, 1]) }).toStrictEqual({
      dice: [Element.Hydro, Element.Cryo],
      isPaid: true,
    });
  });

  test("should pay Matching dice from the character's own element and Unaligned dice from any face", () => {
    expect.hasAssertions();

    const side = createSideState([Element.Cryo, Element.Hydro, Element.Geo]);
    const costs: GcgCost[] = [
      { count: 1, kind: GcgCostKind.Matching },
      { count: 1, kind: GcgCostKind.Unaligned },
    ];

    expect({ dice: side.dice, isPaid: payGcgCost(side, MATCHING_ELEMENT, costs, [0, 1]) }).toStrictEqual({
      dice: [Element.Geo],
      isPaid: true,
    });
  });

  test("should refuse dice that lack the element, leaving the dice as they were", () => {
    expect.hasAssertions();

    const side = createSideState([Element.Hydro, Element.Cryo]);
    const costs: GcgCost[] = [{ count: 1, element: Element.Pyro, kind: GcgCostKind.Dice }];

    expect({ dice: side.dice, isPaid: payGcgCost(side, MATCHING_ELEMENT, costs, [0]) }).toStrictEqual({
      dice: [Element.Hydro, Element.Cryo],
      isPaid: false,
    });
  });

  test("should refuse a choice of more or fewer dice than the costs take", () => {
    expect.hasAssertions();

    const side = createSideState([Element.Pyro, Element.Pyro]);
    const costs: GcgCost[] = [{ count: 1, element: Element.Pyro, kind: GcgCostKind.Dice }];

    expect(payGcgCost(side, MATCHING_ELEMENT, costs, [0, 1])).toBe(false);
  });
});
