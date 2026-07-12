import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { describe, expect, test, vi } from "vitest";

// Pin the damage roll to its upper bound so the formula is deterministic
vi.mock(import("#shared/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 1 }));

describe(calculateDamage, () => {
  const attack = 10;
  const power = 40;

  test("deals full attack damage at zero defense", () => {
    expect.hasAssertions();

    expect(calculateDamage(attack, power, 0)).toBe(attack);
  });

  test("higher power deals more damage", () => {
    expect.hasAssertions();

    expect(calculateDamage(attack, power, 5)).toBe(9);
    expect(calculateDamage(attack, 55, 5)).toBe(10);
  });

  test("defense saturates damage without granting immunity", () => {
    expect.hasAssertions();

    expect(calculateDamage(attack, power, power)).toBe(attack / 2);
    expect(calculateDamage(attack, power, 4000)).toBe(1);
  });
});
