import type { ElementalSight } from "#src/models/sight/ElementalSight";

import { SIGHT_REACH, SIGHT_SPREAD_SPEED } from "#src/services/elementalSight/constants";
import { getSightRadius } from "#src/services/elementalSight/getSightRadius";
import { describe, expect, test } from "vitest";

const createSight = (spreadSeconds: number): ElementalSight => ({ isOn: true, origin: { x: 0, z: 0 }, spreadSeconds });

describe(getSightRadius, () => {
  test("the range grows at the spread speed until it reaches its reach, and holds there", () => {
    expect.hasAssertions();

    expect(getSightRadius(createSight(1))).toBe(SIGHT_SPREAD_SPEED);
    expect(getSightRadius(createSight(SIGHT_REACH))).toBe(SIGHT_REACH);
  });
});
