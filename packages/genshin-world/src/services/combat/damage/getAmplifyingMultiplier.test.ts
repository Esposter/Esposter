import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { Element } from "#src/models/Element";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { describe, expect, test } from "vitest";

describe(getAmplifyingMultiplier, () => {
  test.each([
    [AmplifyingReactionType.Vaporize, Element.Hydro, 2],
    [AmplifyingReactionType.Vaporize, Element.Pyro, 1.5],
    [AmplifyingReactionType.Melt, Element.Pyro, 2],
    [AmplifyingReactionType.Melt, Element.Cryo, 1.5],
  ])("multiplies %s triggered by %s by %f", (amplifyingReactionType, triggerElement, multiplier) => {
    expect.hasAssertions();

    expect(getAmplifyingMultiplier(amplifyingReactionType, triggerElement, 0)).toBe(multiplier);
  });

  test("raises the multiplier by 2.78 × EM / (EM + 1400) and the reaction bonus", () => {
    expect.hasAssertions();

    const multiplier = getAmplifyingMultiplier(AmplifyingReactionType.Vaporize, Element.Hydro, 100, 0.15);

    expect(multiplier).toBeCloseTo(2 * (1 + (2.78 * 100) / 1500 + 0.15));
  });
});
