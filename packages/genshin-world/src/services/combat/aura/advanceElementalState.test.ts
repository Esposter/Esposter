import type { Aura } from "#src/models/combat/Aura";
import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Reaction } from "#src/models/combat/Reaction";

import { AuraType } from "#src/models/combat/AuraType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { FREEZE_DECAY_RATE } from "#src/services/combat/aura/constants";
import { createElementalState } from "#src/services/combat/aura/createElementalState";
import { describe, expect, test } from "vitest";

describe(advanceElementalState, () => {
  const stepSeconds = 1 / 60;
  const createState = (auras: [AuraType, Aura][]): ElementalState => ({
    ...createElementalState(),
    auras: new Map(auras),
  });
  const run = (state: ElementalState, seconds: number): Reaction[] => {
    const reactions: Reaction[] = [];
    for (let step = 0; step < Math.round(seconds / stepSeconds); step++)
      advanceElementalState(state, stepSeconds, reactions);
    return reactions;
  };

  test("decays a 2U attack's aura out over 12 seconds", () => {
    expect.hasAssertions();

    const state = createElementalState();
    applyElement(state, Element.Pyro, 2);
    run(state, 11.9);

    expect(state.auras.has(AuraType.Pyro)).toBe(true);

    run(state, 0.2);

    expect(state.auras.has(AuraType.Pyro)).toBe(false);
  });

  test("thaws a 1.6U Freeze after 2√12 - 4 seconds, its decay quickening as it holds", () => {
    expect.hasAssertions();

    const state = createState([[AuraType.Freeze, { decayRate: FREEZE_DECAY_RATE, gauge: 1.6 }]]);
    advanceElementalState(state, 2.92, []);

    expect(state.auras.has(AuraType.Freeze)).toBe(true);

    advanceElementalState(state, 0.01, []);

    expect(state.auras.has(AuraType.Freeze)).toBe(false);
  });

  test.each([
    [0.46, 5],
    [0.42, 4],
  ])(
    "ticks Electro-Charged each second over a %fU Electro, and once more as it decays out if half a second has passed",
    (gauge, tickCount) => {
      expect.hasAssertions();

      const state = createState([
        [AuraType.Electro, { decayRate: 0.1, gauge }],
        [AuraType.Hydro, { decayRate: 0, gauge: 1 }],
      ]);
      const reactions = run(state, 10);

      expect(reactions).toStrictEqual(
        Array.from({ length: tickCount }, () => ({
          element: Element.Electro,
          reactionType: ReactionType.ElectroCharged,
        })),
      );
    },
  );

  test("ticks Burning each quarter second, its Pyro applying once each two seconds", () => {
    expect.hasAssertions();

    const state = createState([
      [AuraType.Burning, { decayRate: 0, gauge: 2 }],
      [AuraType.Dendro, { decayRate: 0, gauge: 4 }],
    ]);
    const reactions: Reaction[] = [];
    advanceElementalState(state, 2.25, reactions);

    expect(reactions).toStrictEqual(
      [1, 0, 0, 0, 0, 0, 0, 0, 1].map((spreadGauge) => ({
        element: Element.Pyro,
        reactionType: ReactionType.Burning,
        spreadGauge,
      })),
    );
  });

  test("burns its Dendro at twice its decay, going out once the Dendro is gone", () => {
    expect.hasAssertions();

    const state = createState([
      [AuraType.Burning, { decayRate: 0, gauge: 2 }],
      [AuraType.Dendro, { decayRate: 0.5, gauge: 1 }],
    ]);
    const reactions: Reaction[] = [];
    advanceElementalState(state, 2, reactions);

    expect(reactions).toStrictEqual(
      [1, 0, 0].map((spreadGauge) => ({ element: Element.Pyro, reactionType: ReactionType.Burning, spreadGauge })),
    );
    expect(state.auras.has(AuraType.Burning)).toBe(false);
    expect(state.auras.has(AuraType.Dendro)).toBe(false);
  });
});
