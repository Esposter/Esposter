import { getDamage } from "@/services/dungeons/monster/getDamage";
import { describe, expect, test, vi } from "vitest";

// Pin the damage roll to its upper bound so the formula is deterministic
vi.mock(import("@/util/math/random/createRandomNumber"), () => ({ createRandomNumber: () => 1 }));

describe(getDamage, () => {
  const attack = 10;
  const power = 40;

  test("deals full attack damage at zero defense", () => {
    expect.hasAssertions();

    expect(getDamage(attack, power, 0)).toBe(attack);
  });

  test("higher power deals more damage", () => {
    expect.hasAssertions();

    expect(getDamage(attack, power, 5)).toBe(9);
    expect(getDamage(attack, 55, 5)).toBe(10);
  });

  test("defense saturates damage without granting immunity", () => {
    expect.hasAssertions();

    expect(getDamage(attack, power, power)).toBe(attack / 2);
    expect(getDamage(attack, power, 4000)).toBe(1);
  });
});
