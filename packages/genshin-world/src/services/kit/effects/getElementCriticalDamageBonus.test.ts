import type { KitEffect } from "#src/models/kit/KitEffect";

import { Element } from "#src/models/Element";
import { getElementCriticalDamageBonus } from "#src/services/kit/effects/getElementCriticalDamageBonus";
import { describe, expect, test } from "vitest";

const CHARACTER_ID = 10_000_063;
const OTHER_CHARACTER_ID = 10_000_081;

const createElementCriticalDamage = (characterId: number, element: Element, amount: number): KitEffect => ({
  amount,
  characterId,
  element,
  kind: "elementCriticalDamage",
  secondsRemaining: 1,
});

describe(getElementCriticalDamageBonus, () => {
  test("sums the CRIT DMG of the element's effects on the character alone", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [
      createElementCriticalDamage(CHARACTER_ID, Element.Cryo, 0.15),
      createElementCriticalDamage(CHARACTER_ID, Element.Cryo, 0.1),
      createElementCriticalDamage(CHARACTER_ID, Element.Pyro, 0.2),
      createElementCriticalDamage(OTHER_CHARACTER_ID, Element.Cryo, 0.3),
    ];

    expect(getElementCriticalDamageBonus(effects, CHARACTER_ID, Element.Cryo)).toBeCloseTo(0.25);
  });

  test("gives no bonus to a strike of no element", () => {
    expect.hasAssertions();
    const effects: KitEffect[] = [createElementCriticalDamage(CHARACTER_ID, Element.Cryo, 0.15)];

    expect(getElementCriticalDamageBonus(effects, CHARACTER_ID, undefined)).toBe(0);
  });
});
