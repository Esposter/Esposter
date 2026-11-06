import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { createMonument } from "#src/services/puzzle/createMonument.test";
import { strikeElementalMonument } from "#src/services/puzzle/strikeElementalMonument";
import { describe, expect, test } from "vitest";

describe(strikeElementalMonument, () => {
  test("a strike of its element lights a monument", () => {
    expect.hasAssertions();

    const monument = createMonument(false);
    strikeElementalMonument(monument, Element.Pyro, 1);

    expect({ isLit: monument.isLit, litSeconds: monument.litSeconds }).toStrictEqual({ isLit: true, litSeconds: 0 });
  });

  test("a strike of another element does not light a monument", () => {
    expect.hasAssertions();

    const monument = createMonument(false);
    strikeElementalMonument(monument, Element.Hydro, 1);

    expect(monument.isLit).toBe(false);
  });

  test("a reaction of its element lights a monument", () => {
    expect.hasAssertions();

    const monument = createMonument(false);
    monument.elementalState.auras.set(AuraType.Pyro, { decayRate: 1, gauge: 2, isImmutable: false });
    strikeElementalMonument(monument, Element.Anemo, 1);

    expect(monument.isLit).toBe(true);
  });

  test("restarts a lit monument's clock from the strike that lights it again", () => {
    expect.hasAssertions();

    const monument = { ...createMonument(false), isTimed: true };
    strikeElementalMonument(monument, Element.Pyro, 1);
    monument.elementalState.seconds = 40;
    strikeElementalMonument(monument, Element.Pyro, 1);

    expect(monument.litSeconds).toBe(40);
  });
});
