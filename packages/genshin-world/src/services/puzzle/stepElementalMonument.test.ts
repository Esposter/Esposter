import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { ELEMENTAL_MONUMENT_LIT_SECONDS } from "#src/services/puzzle/constants";
import { createMonument } from "#src/services/puzzle/createMonument.test";
import { stepElementalMonument } from "#src/services/puzzle/stepElementalMonument";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { describe, expect, test } from "vitest";

describe(stepElementalMonument, () => {
  test("a timed monument goes out after its time", () => {
    expect.hasAssertions();

    const monument = { ...createMonument(false), isTimed: true };
    strikeElementalMonument(monument, Element.Pyro, 1);
    stepElementalMonument(monument, ELEMENTAL_MONUMENT_LIT_SECONDS - 1);
    const isLitBeforeTime = monument.isLit;
    stepElementalMonument(monument, 1);

    expect({ isLitAfterTime: monument.isLit, isLitBeforeTime }).toStrictEqual({
      isLitAfterTime: false,
      isLitBeforeTime: true,
    });
  });

  test("keeps an untimed monument lit however long it has been since it was lit", () => {
    expect.hasAssertions();

    const monument = createMonument(false);
    strikeElementalMonument(monument, Element.Pyro, 1);
    stepElementalMonument(monument, ELEMENTAL_MONUMENT_LIT_SECONDS * 2);

    expect(monument.isLit).toBe(true);
  });

  test("lights a monument by a Burning tick's Pyro as a strike would, while the Dendro under the Burning lasts", () => {
    expect.hasAssertions();

    const monument = createMonument(false);
    monument.elementalState.auras.set(AuraType.Burning, { decayRate: 0, gauge: 2, isImmutable: false });
    monument.elementalState.auras.set(AuraType.Dendro, { decayRate: 1, gauge: 2, isImmutable: false });
    stepElementalMonument(monument, 1);

    expect(monument.isLit).toBe(true);
  });
});
