import type { HeatSource } from "#src/models/sheerCold/HeatSource";

import { SHEER_COLD_HEAT_RADIUS } from "#src/services/sheerCold/constants";
import { isHeatedBy } from "#src/services/sheerCold/isHeatedBy";
import { describe, expect, test } from "vitest";

const campfire = (x: number, isLit: boolean): HeatSource => ({ isLit, x, z: 0 });

describe(isHeatedBy, () => {
  test("should heat the character beside a lit campfire", () => {
    expect.hasAssertions();

    expect(isHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS, true)])).toBe(true);
  });

  test("should not heat the character beside an unlit campfire", () => {
    expect.hasAssertions();

    expect(isHeatedBy(0, 0, [campfire(1, false)])).toBe(false);
  });

  test("should not heat the character beyond a lit campfire's radius", () => {
    expect.hasAssertions();

    expect(isHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS + 1, true)])).toBe(false);
  });

  test("should not heat the character where no heat source is placed", () => {
    expect.hasAssertions();

    expect(isHeatedBy(0, 0, [])).toBe(false);
  });
});
