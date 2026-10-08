import type { Shield } from "#src/models/combat/Shield";

import { Element } from "#src/models/Element";
import { absorbShieldDamage } from "#src/services/combat/shield/absorbShieldDamage";
import { describe, expect, test } from "vitest";

describe(absorbShieldDamage, () => {
  test.each<[Element | undefined, Element | undefined, number, number, number]>([
    [Element.Hydro, Element.Hydro, 1000, 600, 0],
    [Element.Hydro, Element.Pyro, 1500, 0, 500],
    [Element.Geo, undefined, 1500, 0, 0],
    [undefined, undefined, 1500, 0, 500],
  ])(
    "leaves a 1000-health %s shield hit by %s damage of %i with %i health, passing %i on",
    (shieldElement, element, damage, health, overflow) => {
      expect.hasAssertions();

      const shield: Shield = { element: shieldElement, health: 1000 };

      expect(absorbShieldDamage(shield, damage, 0, element)).toBe(overflow);
      expect(shield.health).toBeCloseTo(health);
    },
  );

  test("raises every absorption by the character's shield strength", () => {
    expect.hasAssertions();

    const shield: Shield = { element: Element.Geo, health: 1000 };

    expect(absorbShieldDamage(shield, 3000, 0.5)).toBe(750);
    expect(shield.health).toBe(0);
  });
});
