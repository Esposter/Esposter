import type { SheerCold } from "#src/models/sheerCold/SheerCold";
import type { SheerColdStep } from "#src/models/sheerCold/SheerColdStep";

import {
  SHEER_COLD_DAMAGE_FLAT,
  SHEER_COLD_DAMAGE_INTERVAL_SECONDS,
  SHEER_COLD_DAMAGE_SHARE,
  SHEER_COLD_GAIN_PER_SECOND,
  SHEER_COLD_HEAT_DRAIN_PER_SECOND,
  SHEER_COLD_LEAVE_DRAIN_PER_SECOND,
  SHEER_COLD_MAXIMUM,
  SHEER_COLD_SNOWSTORM_MODIFIER,
  SHEER_COLD_SWIM_MODIFIER,
} from "#src/services/sheerCold/constants";
import { stepSheerCold } from "#src/services/sheerCold/stepSheerCold";
import { describe, expect, test } from "vitest";

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
// The damage one interval costs a character with the test's max HP
const intervalDamage = SHEER_COLD_DAMAGE_SHARE * maxHealth + SHEER_COLD_DAMAGE_FLAT;

describe(stepSheerCold, () => {
  test("should fill the gauge in the subzero climate", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, inCold, 2);

    expect(sheerCold.value).toBeCloseTo(2 * SHEER_COLD_GAIN_PER_SECOND);
  });

  test("should fill the gauge faster while swimming", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, { ...inCold, isSwimming: true }, 2);

    expect(sheerCold.value).toBeCloseTo(2 * SHEER_COLD_GAIN_PER_SECOND * (1 + SHEER_COLD_SWIM_MODIFIER));
  });

  test("should fill the gauge faster in a snowstorm", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(sheerCold, { ...inCold, isSnowstorm: true }, 2);

    expect(sheerCold.value).toBeCloseTo(2 * SHEER_COLD_GAIN_PER_SECOND * (1 + SHEER_COLD_SNOWSTORM_MODIFIER));
  });

  test("should suppress the fill with an anti-cold dish", () => {
    expect.hasAssertions();

    const filled: SheerCold = { damageSeconds: 0, value: 0 };
    stepSheerCold(filled, { ...inCold, antiColdRatio: -0.5 }, 2);
    const suppressed: SheerCold = { damageSeconds: 0, value: 40 };
    stepSheerCold(suppressed, { ...inCold, antiColdRatio: -1 }, 2);

    expect(filled.value).toBeCloseTo(2 * SHEER_COLD_GAIN_PER_SECOND * 0.5);
    expect(suppressed.value).toBe(40);
  });

  test("should drain the gauge outside the climate with no heat", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 40 };
    stepSheerCold(sheerCold, outOfCold, 2);

    expect(sheerCold.value).toBeCloseTo(40 - 2 * SHEER_COLD_LEAVE_DRAIN_PER_SECOND);
  });

  test("should drain the gauge near heat, wherever it stands", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 80 };
    stepSheerCold(sheerCold, heated, 2);
    const heatedOutOfCold: SheerCold = { damageSeconds: 0, value: 80 };
    stepSheerCold(heatedOutOfCold, { ...outOfCold, isHeated: true }, 2);

    expect(sheerCold.value).toBeCloseTo(80 - 2 * SHEER_COLD_HEAT_DRAIN_PER_SECOND);
    expect(heatedOutOfCold.value).toBeCloseTo(80 - 2 * SHEER_COLD_HEAT_DRAIN_PER_SECOND);
  });

  test("should keep the gauge between none and its maximum", () => {
    expect.hasAssertions();

    const drained: SheerCold = { damageSeconds: 0, value: 1 };
    stepSheerCold(drained, heated, 10);
    const filled: SheerCold = { damageSeconds: 0, value: SHEER_COLD_MAXIMUM - 1 };
    stepSheerCold(filled, inCold, 10);

    expect(drained.value).toBe(0);
    expect(filled.value).toBe(SHEER_COLD_MAXIMUM);
  });

  test("should deal its share of damage for each interval it stays full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: SHEER_COLD_MAXIMUM };
    const damage = stepSheerCold(sheerCold, inCold, 2);

    expect(damage).toBeCloseTo(2 * intervalDamage);
    expect(sheerCold.damageSeconds).toBe(0);
  });

  test("should carry a part interval into the next step before dealing damage", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: SHEER_COLD_MAXIMUM };
    const firstDamage = stepSheerCold(sheerCold, inCold, SHEER_COLD_DAMAGE_INTERVAL_SECONDS / 2);

    expect(firstDamage).toBe(0);
    expect(stepSheerCold(sheerCold, inCold, SHEER_COLD_DAMAGE_INTERVAL_SECONDS / 2)).toBeCloseTo(intervalDamage);
  });

  test("should deal no damage while the gauge is not full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };

    expect(stepSheerCold(sheerCold, outOfCold, 10)).toBe(0);
  });

  test("should clear its damage interval once heat drains the gauge below full", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 1, value: SHEER_COLD_MAXIMUM };
    stepSheerCold(sheerCold, { ...heated, isInCold: false }, 1);

    expect(sheerCold.damageSeconds).toBe(0);
  });
});
