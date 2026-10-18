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
  SHEER_COLD_SWIM_MODIFIER,
} from "#src/services/sheerCold/constants";
import { stepSheerCold } from "#src/services/sheerCold/stepSheerCold";
import { describe, expect, test } from "vitest";

const maxHealth = 1000;
const empty: SheerCold = { damageSeconds: 0, value: 0 };
const inCold: SheerColdStep = { antiColdRatio: 0, isHeated: false, isInCold: true, isSwimming: false, maxHealth };
const outOfCold: SheerColdStep = { antiColdRatio: 0, isHeated: false, isInCold: false, isSwimming: false, maxHealth };
const heated: SheerColdStep = { antiColdRatio: 0, isHeated: true, isInCold: true, isSwimming: false, maxHealth };
// The damage one interval costs a character with the test's max HP
const intervalDamage = SHEER_COLD_DAMAGE_SHARE * maxHealth + SHEER_COLD_DAMAGE_FLAT;

describe(stepSheerCold, () => {
  test("should fill the gauge in the subzero climate", () => {
    expect.hasAssertions();

    expect(stepSheerCold(empty, inCold, 2).sheerCold.value).toBeCloseTo(2 * SHEER_COLD_GAIN_PER_SECOND);
  });

  test("should fill the gauge faster while swimming", () => {
    expect.hasAssertions();

    expect(stepSheerCold(empty, { ...inCold, isSwimming: true }, 2).sheerCold.value).toBeCloseTo(
      2 * SHEER_COLD_GAIN_PER_SECOND * (1 + SHEER_COLD_SWIM_MODIFIER),
    );
  });

  test("should suppress the fill with an anti-cold dish", () => {
    expect.hasAssertions();

    expect(stepSheerCold(empty, { ...inCold, antiColdRatio: -0.5 }, 2).sheerCold.value).toBeCloseTo(
      2 * SHEER_COLD_GAIN_PER_SECOND * 0.5,
    );
    expect(stepSheerCold({ damageSeconds: 0, value: 40 }, { ...inCold, antiColdRatio: -1 }, 2).sheerCold.value).toBe(
      40,
    );
  });

  test("should drain the gauge outside the climate with no heat", () => {
    expect.hasAssertions();

    expect(stepSheerCold({ damageSeconds: 0, value: 40 }, outOfCold, 2).sheerCold.value).toBeCloseTo(
      40 - 2 * SHEER_COLD_LEAVE_DRAIN_PER_SECOND,
    );
  });

  test("should drain the gauge near heat, wherever it stands", () => {
    expect.hasAssertions();

    const sheerCold: SheerCold = { damageSeconds: 0, value: 80 };

    expect(stepSheerCold(sheerCold, heated, 2).sheerCold.value).toBeCloseTo(80 - 2 * SHEER_COLD_HEAT_DRAIN_PER_SECOND);
    expect(stepSheerCold(sheerCold, { ...outOfCold, isHeated: true }, 2).sheerCold.value).toBeCloseTo(
      80 - 2 * SHEER_COLD_HEAT_DRAIN_PER_SECOND,
    );
  });

  test("should keep the gauge between none and its maximum", () => {
    expect.hasAssertions();

    expect(stepSheerCold({ damageSeconds: 0, value: 1 }, heated, 10).sheerCold.value).toBe(0);
    expect(stepSheerCold({ damageSeconds: 0, value: SHEER_COLD_MAXIMUM - 1 }, inCold, 10).sheerCold.value).toBe(
      SHEER_COLD_MAXIMUM,
    );
  });

  test("should deal its share of damage for each interval it stays full", () => {
    expect.hasAssertions();

    const { damage, sheerCold } = stepSheerCold({ damageSeconds: 0, value: SHEER_COLD_MAXIMUM }, inCold, 2);

    expect(damage).toBeCloseTo(2 * intervalDamage);
    expect(sheerCold.damageSeconds).toBe(0);
  });

  test("should carry a part interval into the next step before dealing damage", () => {
    expect.hasAssertions();

    const full: SheerCold = { damageSeconds: 0, value: SHEER_COLD_MAXIMUM };
    const first = stepSheerCold(full, inCold, SHEER_COLD_DAMAGE_INTERVAL_SECONDS / 2);

    expect(first.damage).toBe(0);
    expect(stepSheerCold(first.sheerCold, inCold, SHEER_COLD_DAMAGE_INTERVAL_SECONDS / 2).damage).toBeCloseTo(
      intervalDamage,
    );
  });

  test("should deal no damage while the gauge is not full", () => {
    expect.hasAssertions();

    expect(stepSheerCold(empty, outOfCold, 10).damage).toBe(0);
  });

  test("should clear its damage interval once heat drains the gauge below full", () => {
    expect.hasAssertions();

    expect(
      stepSheerCold({ damageSeconds: 1, value: SHEER_COLD_MAXIMUM }, { ...heated, isInCold: false }, 1).sheerCold
        .damageSeconds,
    ).toBe(0);
  });
});
