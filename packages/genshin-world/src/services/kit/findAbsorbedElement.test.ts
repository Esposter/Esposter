import type { Enemy } from "#src/models/enemy/Enemy";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { findAbsorbedElement } from "#src/services/kit/findAbsorbedElement";
import { describe, expect, test } from "vitest";

// An enemy holding each of the auras, at a gauge of 1
const createAuraHolder = (...auraTypes: AuraType[]): Pick<Enemy, "elementalState"> => {
  const elementalState = createElementalState();
  for (const auraType of auraTypes) elementalState.auras.set(auraType, { decayRate: 0, gauge: 1, isImmutable: false });
  return { elementalState };
};

describe(findAbsorbedElement, () => {
  test.each([
    [[[AuraType.Cryo], [AuraType.Electro], [AuraType.Hydro], [AuraType.Pyro]], Element.Pyro],
    [[[AuraType.Cryo, AuraType.Hydro], [AuraType.Electro]], Element.Hydro],
    [[[AuraType.Burning]], Element.Pyro],
    [[[AuraType.Freeze]], Element.Cryo],
    [[[AuraType.Dendro, AuraType.Quicken]], undefined],
  ])("takes from enemies holding %s the first element in priority any of them holds: %s", (auraTypesList, element) => {
    expect.hasAssertions();

    expect(findAbsorbedElement(auraTypesList.map((auraTypes) => createAuraHolder(...auraTypes)))).toBe(element);
  });
});
