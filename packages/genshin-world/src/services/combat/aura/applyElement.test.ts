import type { Aura } from "#src/models/combat/Aura";
import type { ElementalState } from "#src/models/combat/ElementalState";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { FREEZE_DECAY_RATE } from "#src/services/combat/aura/constants";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { describe, expect, test } from "vitest";

describe(applyElement, () => {
  const createState = (auras: [AuraType, Aura][]): ElementalState => ({
    ...createElementalState(),
    auras: new Map(auras),
  });

  test("taxes an attack's gauge to four fifths as an aura, decaying over 2.5 seconds a unit plus 7", () => {
    expect.hasAssertions();

    const state = createElementalState();
    const reactions = applyElement(state, Element.Pyro, 2);

    expect(reactions).toStrictEqual([]);
    expect(state.auras).toStrictEqual(new Map([[AuraType.Pyro, { decayRate: 1.6 / 12, gauge: 1.6 }]]));
  });

  test("keeps the larger gauge at the first aura's rate, so 2U Cryo over a 1U aura lasts 19 seconds", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Cryo, 1);
    applyElement(state, Element.Cryo, 2);
    const cryo = state.auras.get(AuraType.Cryo);

    expect(cryo).toStrictEqual({ decayRate: 0.8 / 9.5, gauge: 1.6 });
    expect((cryo?.gauge ?? 0) / (cryo?.decayRate ?? 1)).toBeCloseTo(19);
  });

  test("replaces a smaller Pyro with its own rate", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Pyro, 1);
    applyElement(state, Element.Pyro, 2);

    expect(state.auras).toStrictEqual(new Map([[AuraType.Pyro, { decayRate: 1.6 / 12, gauge: 1.6 }]]));
  });

  test("leaves 0.6U of a 1.6U Electro after 1U of Cryo superconducts it, at the Electro's rate", () => {
    expect.hasAssertions();

    const state = createState([[AuraType.Electro, { decayRate: 1.6 / 12, gauge: 1.6 }]]);
    const reactions = applyElement(state, Element.Cryo, 1);

    expect(reactions).toStrictEqual([{ element: Element.Cryo, reactionType: ReactionType.Superconduct }]);
    expect(state.auras).toStrictEqual(
      new Map([[AuraType.Electro, { decayRate: 1.6 / 12, gauge: expect.closeTo(0.6) }]]),
    );
  });

  test("melts 2U of Pyro four times with 1U of Cryo, and 2U of Cryo once with 1U of Pyro", () => {
    expect.hasAssertions();

    const pyroState = createState([[AuraType.Pyro, { decayRate: 0, gauge: 2 }]]);
    const cryoState = createState([[AuraType.Cryo, { decayRate: 0, gauge: 2 }]]);
    const cryoMelts = Array.from({ length: 4 }, () => applyElement(pyroState, Element.Cryo, 1));
    const pyroMelt = applyElement(cryoState, Element.Pyro, 1);

    expect(cryoMelts.flat().map(({ reactionType }) => reactionType)).toStrictEqual(
      Array.from({ length: 4 }, () => ReactionType.Melt),
    );
    expect(pyroState.auras).toStrictEqual(new Map());
    expect(pyroMelt).toStrictEqual([{ element: Element.Pyro, reactionType: ReactionType.Melt }]);
    expect(cryoState.auras).toStrictEqual(new Map());
  });

  test.each([
    [1, []],
    [2, [{ element: Element.Dendro, reactionType: ReactionType.Bloom }]],
  ])(
    "vaporizes the Burning and the Pyro together with %iU of Hydro before blooming the Dendro with what is left",
    (gauge, bloom) => {
      expect.hasAssertions();

      const state = createState([
        [AuraType.Burning, { decayRate: 0, gauge: 2 }],
        [AuraType.Dendro, { decayRate: 0, gauge: 1 }],
        [AuraType.Pyro, { decayRate: 0, gauge: 1 }],
      ]);
      const reactions = applyElement(state, Element.Hydro, gauge);

      expect(reactions).toStrictEqual([{ element: Element.Hydro, reactionType: ReactionType.Vaporize }, ...bloom]);
      expect(state.auras).toStrictEqual(new Map([[AuraType.Dendro, { decayRate: 0, gauge: 1 - 0.5 * bloom.length }]]));
    },
  );

  test("swirls 0.8U of Hydro with 1U of Anemo, spreading 2.2U of Hydro", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Hydro, 1);
    const reactions = applyElement(state, Element.Anemo, 1);

    expect(reactions).toStrictEqual([
      { element: Element.Hydro, reactionType: ReactionType.Swirl, spreadGauge: expect.closeTo(2.2) },
    ]);
    expect(state.auras.get(AuraType.Hydro)?.gauge).toBeCloseTo(0.3);
  });

  test("crystallizes 0.5U of a 0.8U Electro with 1U of Geo, and not again within the second", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Electro, 1);
    const reactions = applyElement(state, Element.Geo, 1);
    const repeatedReactions = applyElement(state, Element.Geo, 1);

    expect(reactions).toStrictEqual([{ element: Element.Electro, reactionType: ReactionType.Crystallize }]);
    expect(repeatedReactions).toStrictEqual([]);
    expect(state.auras.get(AuraType.Electro)?.gauge).toBeCloseTo(0.3);
  });

  test("crystallizes the Electro of an Electro-Charged target and not the Hydro beside it, once a second", () => {
    expect.hasAssertions();

    const hydro = { decayRate: 0, gauge: 1 };
    const state = createState([
      [AuraType.Electro, { decayRate: 0, gauge: 0.4 }],
      [AuraType.Hydro, hydro],
    ]);
    const reactions = applyElement(state, Element.Geo, 2);

    expect(reactions).toStrictEqual([{ element: Element.Electro, reactionType: ReactionType.Crystallize }]);
    expect(state.auras).toStrictEqual(new Map([[AuraType.Hydro, hydro]]));
  });

  test("freezes a target with twice the gauge it consumed", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Hydro, 1);
    const reactions = applyElement(state, Element.Cryo, 2);

    expect(reactions).toStrictEqual([{ reactionType: ReactionType.Frozen }]);
    expect(state.auras.get(AuraType.Freeze)).toStrictEqual({ decayRate: FREEZE_DECAY_RATE, gauge: 1.6 });
    expect(state.auras.has(AuraType.Hydro)).toBe(false);
  });

  test("melts only the Freeze over a Hydro with Pyro, the Hydro hidden and the Pyro left as no aura", () => {
    expect.hasAssertions();

    const hydro = { decayRate: 0, gauge: 1 };
    const state = createState([
      [AuraType.Freeze, { decayRate: FREEZE_DECAY_RATE, gauge: 1 }],
      [AuraType.Hydro, hydro],
    ]);
    const reactions = applyElement(state, Element.Pyro, 2);

    expect(reactions).toStrictEqual([{ element: Element.Pyro, reactionType: ReactionType.Melt }]);
    expect(state.auras).toStrictEqual(new Map([[AuraType.Hydro, hydro]]));
  });

  test("shatters a Freeze with a Geo hit its internal cooldown leaves at no gauge", () => {
    expect.hasAssertions();

    const state = createState([[AuraType.Freeze, { decayRate: FREEZE_DECAY_RATE, gauge: 1.6 }]]);
    const reactions = applyElement(state, Element.Geo, 0);

    expect(reactions).toStrictEqual([{ reactionType: ReactionType.Shattered }]);
    expect(state.auras).toStrictEqual(new Map());
  });

  test("quickens Dendro with Electro, leaving the gauge it consumed as Quicken for 5 seconds a unit plus 6", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Dendro, 1);
    const reactions = applyElement(state, Element.Electro, 1);

    expect(reactions).toStrictEqual([{ reactionType: ReactionType.Quicken }]);
    expect(state.auras.get(AuraType.Quicken)).toStrictEqual({ decayRate: 0.8 / 10, gauge: 0.8 });
  });

  test("aggravates a Quicken with Electro without consuming either, the Electro left beside it", () => {
    expect.hasAssertions();

    const quicken = { decayRate: 0, gauge: 1 };
    const state = createState([[AuraType.Quicken, quicken]]);
    const reactions = applyElement(state, Element.Electro, 1);

    expect(reactions).toStrictEqual([{ element: Element.Electro, reactionType: ReactionType.Aggravate }]);
    expect(state.auras).toStrictEqual(
      new Map([
        [AuraType.Electro, { decayRate: 0.8 / 9.5, gauge: 0.8 }],
        [AuraType.Quicken, quicken],
      ]),
    );
  });

  test("charges Hydro with Electro, the two lying together and ticking at once", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Hydro, 1);
    const reactions = applyElement(state, Element.Electro, 1);

    expect(reactions).toStrictEqual([{ element: Element.Electro, reactionType: ReactionType.ElectroCharged }]);
    expect(state.auras.get(AuraType.Hydro)?.gauge).toBeCloseTo(0.4);
    expect(state.auras.get(AuraType.Electro)?.gauge).toBeCloseTo(0.4);
  });

  test("lights Dendro with Pyro beside it, and only refreshes a Burning already lit", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Dendro, 1);
    const reactions = applyElement(state, Element.Pyro, 1);
    const refreshReactions = applyElement(state, Element.Pyro, 1);

    expect(reactions).toStrictEqual([{ element: Element.Pyro, reactionType: ReactionType.Burning }]);
    expect(refreshReactions).toStrictEqual([]);
    expect([...state.auras.keys()]).toStrictEqual([AuraType.Dendro, AuraType.Burning, AuraType.Pyro]);
  });
});
