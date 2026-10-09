import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { SpecialResonance } from "#src/models/party/SpecialResonance";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { describe, expect, test } from "vitest";

describe(computeCharacterAttributes, () => {
  test("raises each base, a weapon's included, by its percentage and adds its flat after", () => {
    expect.hasAssertions();

    const { attack, attributeTotalMap, defense, maxHealth } = computeCharacterAttributes([
      { attribute: Attribute.BaseAttack, value: 100 },
      { attribute: Attribute.BaseAttack, value: 50 },
      { attribute: Attribute.AttackPercent, value: 0.5 },
      { attribute: Attribute.Attack, value: 10 },
      { attribute: Attribute.BaseHealth, value: 1000 },
      { attribute: Attribute.Health, value: 100 },
      { attribute: Attribute.CriticalRate, value: 0.25 },
      { attribute: Attribute.CriticalRate, value: 0.5 },
    ]);

    expect({ attack, criticalRate: attributeTotalMap[Attribute.CriticalRate], defense, maxHealth }).toStrictEqual({
      attack: 235,
      criticalRate: 0.75,
      defense: 0,
      maxHealth: 1100,
    });
  });

  test("raises ATK by Pyro's resonance of 25%", () => {
    expect.hasAssertions();

    expect(computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 100 }], [Element.Pyro]).attack).toBe(
      125,
    );
  });

  test("raises Max HP by Hydro's resonance of 25%", () => {
    expect.hasAssertions();

    expect(
      computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 1000 }], [Element.Hydro]).maxHealth,
    ).toBe(1250);
  });

  test("adds Dendro's resonance of 50 Elemental Mastery", () => {
    expect.hasAssertions();

    expect(computeCharacterAttributes([], [Element.Dendro]).attributeTotalMap[Attribute.ElementalMastery]).toBe(50);
  });

  test("raises Shield Strength by Geo's resonance of 15%", () => {
    expect.hasAssertions();

    expect(computeCharacterAttributes([], [Element.Geo]).attributeTotalMap[Attribute.ShieldStrength]).toBe(0.15);
  });

  test("raises Physical RES by the Protective Canopy's 15%", () => {
    expect.hasAssertions();

    expect(
      computeCharacterAttributes([], [SpecialResonance.ProtectiveCanopy]).attributeTotalMap[
        Attribute.PhysicalResistance
      ],
    ).toBe(0.15);
  });
});
