import { getDamage } from "#src/services/combat/damage/getDamage";
import { describe, expect, test } from "vitest";

describe(getDamage, () => {
  test("halves a hit on an enemy of the attacker's level, its defence neither reduced nor ignored", () => {
    expect.hasAssertions();

    expect(getDamage({ characterLevel: 90, enemyLevel: 90, resistance: 0, stat: 1, talentMultiplier: 1 })).toBe(0.5);
  });

  test("multiplies the base damage and flat bonus by the damage bonus, crit, defence, resistance and amplifier", () => {
    expect.hasAssertions();

    const damage = getDamage({
      additiveBaseDamageBonus: 200,
      amplifyingMultiplier: 2,
      characterLevel: 90,
      criticalDamage: 1,
      damageBonus: 0.5,
      enemyLevel: 90,
      isCritical: true,
      resistance: 0.1,
      stat: 1000,
      talentMultiplier: 1.8,
    });

    expect(damage).toBeCloseTo((1.8 * 1000 + 200) * 1.5 * 2 * 0.5 * 0.9 * 2);
  });

  test("lets more of a hit through an enemy whose defence is reduced and ignored", () => {
    expect.hasAssertions();

    const damage = getDamage({
      characterLevel: 90,
      defenseIgnored: 0.5,
      defenseReduction: 0.5,
      enemyLevel: 90,
      resistance: 0,
      stat: 1,
      talentMultiplier: 1,
    });

    expect(damage).toBeCloseTo(190 / (0.25 * 190 + 190));
  });
});
