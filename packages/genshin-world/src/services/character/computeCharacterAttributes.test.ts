import { Attribute } from "#src/models/character/Attribute";
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
});
