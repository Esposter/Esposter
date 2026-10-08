import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { describe, expect, test } from "vitest";

const createMonument = (element: Element, isTimed: boolean): ElementalMonument => ({
  element,
  elementalState: createElementalState(),
  isLit: false,
  isTimed,
  litSeconds: 0,
});

describe(strikeElementalMonument, () => {
  test("lights a monument struck by its own element", () => {
    expect.hasAssertions();

    const monument = createMonument(Element.Pyro, false);
    strikeElementalMonument(monument, Element.Pyro, 1);

    expect({ isLit: monument.isLit, litSeconds: monument.litSeconds }).toStrictEqual({ isLit: true, litSeconds: 0 });
  });

  test("leaves a monument dark when another element reacts to nothing of its own", () => {
    expect.hasAssertions();

    const monument = createMonument(Element.Pyro, false);
    strikeElementalMonument(monument, Element.Hydro, 1);

    expect(monument.isLit).toBe(false);
  });

  test("lights a monument by a reaction whose element is its own, the Swirl that spreads the Pyro on it", () => {
    expect.hasAssertions();

    const monument = createMonument(Element.Pyro, false);
    monument.elementalState.auras.set(AuraType.Pyro, { decayRate: 1, gauge: 2 });
    strikeElementalMonument(monument, Element.Anemo, 1);

    expect(monument.isLit).toBe(true);
  });

  test("restarts a lit monument's clock from the strike that lights it again", () => {
    expect.hasAssertions();

    const monument = createMonument(Element.Pyro, true);
    strikeElementalMonument(monument, Element.Pyro, 1);
    monument.elementalState.seconds = 40;
    strikeElementalMonument(monument, Element.Pyro, 1);

    expect(monument.litSeconds).toBe(40);
  });
});
