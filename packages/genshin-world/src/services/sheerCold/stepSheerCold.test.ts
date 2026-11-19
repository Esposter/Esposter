import type { SheerCold } from "#src/models/sheerCold/SheerCold";
import type { SheerColdStep } from "#src/models/sheerCold/SheerColdStep";

import { stepSheerCold } from "#src/services/sheerCold/stepSheerCold";
import { describe, expect, test } from "vitest";

describe(stepSheerCold, () => {
  const maxHealth = 1000;
  const inCold: SheerColdStep = {
    antiColdRatio: 0,
    isHeated: false,
    isInCold: true,
    isSnowstorm: false,
    isSwimming: false,
    maxHealth,
  };
  const outOfCold: SheerColdStep = {
    antiColdRatio: 0,
    isHeated: false,
    isInCold: false,
    isSnowstorm: false,
    isSwimming: false,
    maxHealth,
  };
  const heated: SheerColdStep = {
    antiColdRatio: 0,
    isHeated: true,
    isInCold: true,
    isSnowstorm: false,
    isSwimming: false,
    maxHealth,
  };

  test("fill the gauge in the subzero climate", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, inCold, 2);

    expect(sheerCold.value).toBeCloseTo(2);
  });

  test("fill the gauge faster while swimming", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, { ...inCold, isSwimming: true }, 2);

    expect(sheerCold.value).toBeCloseTo(5.6);
  });

  test("fill the gauge faster in a snowstorm", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, { ...inCold, isSnowstorm: true }, 2);

    expect(sheerCold.value).toBeCloseTo(6);
  });

  test("suppress the fill with an anti-cold dish", () => {
    expect.hasAssertions();

    const filled: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(filled, { ...inCold, antiColdRatio: -0.5 }, 2);
    const suppressed: SheerCold = { damageSeconds: 0, value: 40 };
    stepSheerCold(suppressed, { ...inCold, antiColdRatio: -1 }, 2);

    expect(filled.value).toBeCloseTo(1);
    expect(suppressed.value).toBe(40);
  });

  test("drain the gauge outside the climate with no heat", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 40 };
    stepSheerCold(sheerCold, outOfCold, 2);

    expect(sheerCold.value).toBeCloseTo(30);
  });

  test("drain the gauge near heat, wherever it stands", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 80 };
    stepSheerCold(sheerCold, heated, 2);
    const heatedOutOfCold: SheerCold = { damageSeconds: 0, value: 80 };
    stepSheerCold(heatedOutOfCold, { ...outOfCold, isHeated: true }, 2);

    expect(sheerCold.value).toBeCloseTo(30);
    expect(heatedOutOfCold.value).toBeCloseTo(30);
  });

  test("keep the gauge between none and its maximum", () => {
    expect.hasAssertions();

    const drained: SheerCold = { damageSeconds: 0, value: 1 };
    stepSheerCold(drained, heated, 10);
    const filled: SheerCold = { damageSeconds: 0, value: 99 };
    stepSheerCold(filled, inCold, 10);

    expect(drained.value).toBe(0);
    expect(filled.value).toBe(100);
  });

  test("deal its share of damage for each interval it stays full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 100 };
    const damage = stepSheerCold(sheerCold, inCold, 2);

    // Two intervals at 160 HP each: 1% of the 1000 max HP and 150 HP flat
    expect(damage).toBeCloseTo(320);
    expect(sheerCold.damageSeconds).toBe(0);
  });

  test("carry a part interval into the next step before dealing damage", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 100 };
    const firstDamage = stepSheerCold(sheerCold, inCold, 0.5);

    expect(firstDamage).toBe(0);
    // One interval at 160 HP: 1% of the 1000 max HP and 150 HP flat
    expect(stepSheerCold(sheerCold, inCold, 0.5)).toBeCloseTo(160);
  });

  test("deal no damage while the gauge is not full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };

    expect(stepSheerCold(sheerCold, outOfCold, 10)).toBe(0);
  });

  test("clear the time toward the next interval once heat drains the gauge below full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 1, value: 100 };
    stepSheerCold(sheerCold, { ...heated, isInCold: false }, 1);

    expect(sheerCold.damageSeconds).toBe(0);
  });
});
