import type { HeatSource } from "#src/models/sheerCold/HeatSource";

import { checkIsHeatedBy } from "#src/services/sheerCold/checkIsHeatedBy";
import { SHEER_COLD_HEAT_RADIUS } from "#src/services/sheerCold/constants";
import { describe, expect, test } from "vitest";

const campfire = (x: number, isLit: boolean): HeatSource => ({ isLit, x, z: 0 });

describe(checkIsHeatedBy, () => {
  test("should heat the character beside a lit campfire", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS, true)])).toBe(true);
  });

  test("should not heat the character beside an unlit campfire", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(1, false)])).toBe(false);
  });

  test("should not heat the character beyond a lit campfire's radius", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS + 1, true)])).toBe(false);
  });

  test("should not heat the character where no heat source is placed", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [])).toBe(false);
  });
});
