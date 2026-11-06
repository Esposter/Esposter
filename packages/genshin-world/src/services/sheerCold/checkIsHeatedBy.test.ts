import type { HeatSource } from "#src/models/sheerCold/HeatSource";

import { checkIsHeatedBy } from "#src/services/sheerCold/checkIsHeatedBy";
import { SHEER_COLD_HEAT_RADIUS } from "#src/services/sheerCold/constants";
import { describe, expect, test } from "vitest";

const campfire = (x: number, isLit: boolean): HeatSource => ({ isLit, x, z: 0 });

describe(checkIsHeatedBy, () => {
  test("heat the character beside a lit campfire", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS, true)])).toBe(true);
  });

  test("leave an unlit campfire unheated", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(1, false)])).toBe(false);
  });

  test("leave a lit campfire beyond its radius unheated", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [campfire(SHEER_COLD_HEAT_RADIUS + 1, true)])).toBe(false);
  });

  test("leave the character unheated where no heat source is placed", () => {
    expect.hasAssertions();

    expect(checkIsHeatedBy(0, 0, [])).toBe(false);
  });
});
