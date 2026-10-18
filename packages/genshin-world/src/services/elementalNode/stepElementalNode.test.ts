import type { ElementalNode } from "#src/models/elementalNode/ElementalNode";

import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { Element } from "#src/models/Element";
import { stepElementalNode } from "#src/services/elementalNode/stepElementalNode";
import { describe, expect, test } from "vitest";

describe(stepElementalNode, () => {
  test("a node pulses once each fifteen seconds", () => {
    expect.hasAssertions();

    const node: ElementalNode = { element: Element.Pyro, secondsUntilPulse: 15 };

    expect(stepElementalNode(node, 10)).toBe(0);
    expect(node.secondsUntilPulse).toBe(5);

    expect(stepElementalNode(node, 5)).toBe(1);
    expect(node).toStrictEqual({ element: Element.Pyro, secondsUntilPulse: 15 });
  });

  test("a long step counts each pulse it passes", () => {
    expect.hasAssertions();

    const node: ElementalNode = { element: Element.Cryo, secondsUntilPulse: 15 };

    expect(stepElementalNode(node, 35)).toBe(2);
    expect(node).toStrictEqual({ element: Element.Cryo, secondsUntilPulse: 10 });
  });

  test("a pulse falls due on the step its seconds run out, not one step late", () => {
    expect.hasAssertions();

    const node: ElementalNode = { element: Element.Pyro, secondsUntilPulse: 5 };
    let pulses = 0;
    for (let step = 0; step < 300; step++) pulses += stepElementalNode(node, FIXED_STEP_SECONDS);

    expect(pulses).toBe(1);
  });
});
