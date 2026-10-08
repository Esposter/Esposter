import type { ElementalState } from "#src/models/combat/ElementalState";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { computeSightElement } from "#src/services/elementalSight/computeSightElement";
import { describe, expect, test } from "vitest";

describe(computeSightElement, () => {
  const AURA_DECAY_RATE = 0;
  const createStateWithAuras = (auras: [AuraType, number][]): ElementalState => {
    const elementalState = createElementalState();
    for (const [auraType, gauge] of auras) elementalState.auras.set(auraType, { decayRate: AURA_DECAY_RATE, gauge });
    return elementalState;
  };

  test("a target with no aura shows its innate element, and none when it has neither", () => {
    expect.hasAssertions();

    expect(computeSightElement(createElementalState(), Element.Hydro)).toBe(Element.Hydro);
    expect(computeSightElement(createElementalState())).toBeUndefined();
  });

  test("the element of its strongest aura is shown over its innate element", () => {
    expect.hasAssertions();

    const elementalState = createStateWithAuras([
      [AuraType.Cryo, 1],
      [AuraType.Pyro, 2],
    ]);
    expect(computeSightElement(elementalState, Element.Hydro)).toBe(Element.Pyro);
  });

  test("a burning aura shows as pyro, and quicken, which names no one element, falls back to the innate element", () => {
    expect.hasAssertions();

    expect(computeSightElement(createStateWithAuras([[AuraType.Burning, 1]]))).toBe(Element.Pyro);
    expect(computeSightElement(createStateWithAuras([[AuraType.Quicken, 5]]), Element.Hydro)).toBe(Element.Hydro);
  });
});
