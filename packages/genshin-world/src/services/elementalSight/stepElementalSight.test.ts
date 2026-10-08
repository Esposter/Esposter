import type { ElementalSight } from "#src/models/sight/ElementalSight";

import { SIGHT_WALK_LIMIT } from "#src/services/elementalSight/constants";
import { stepElementalSight } from "#src/services/elementalSight/stepElementalSight";
import { describe, expect, test } from "vitest";

const createSight = (): ElementalSight => ({ isOn: false, origin: { x: 0, z: 0 }, spreadSeconds: 0 });

describe(stepElementalSight, () => {
  const DELTA_SECONDS = 1;

  test("a press turns it on where the character stands, and a second press turns it off", () => {
    expect.hasAssertions();

    const sight = createSight();
    stepElementalSight(sight, { x: 4, y: 0, z: 5 }, DELTA_SECONDS, true);
    expect(sight).toStrictEqual({ isOn: true, origin: { x: 4, z: 5 }, spreadSeconds: 0 });
    stepElementalSight(sight, { x: 4, y: 0, z: 5 }, DELTA_SECONDS, true);
    expect(sight.isOn).toBe(false);
  });

  test("it spreads for as long as it stays on, standing still included", () => {
    expect.hasAssertions();

    const sight = createSight();
    stepElementalSight(sight, { x: 0, y: 0, z: 0 }, DELTA_SECONDS, true);
    stepElementalSight(sight, { x: 0, y: 0, z: 0 }, DELTA_SECONDS, false);
    stepElementalSight(sight, { x: 0, y: 0, z: 0 }, DELTA_SECONDS, false);
    expect(sight).toStrictEqual({ isOn: true, origin: { x: 0, z: 0 }, spreadSeconds: 2 });
  });

  test("it stays on within the walk limit of where it was turned on and turns off past it", () => {
    expect.hasAssertions();

    const sight = createSight();
    stepElementalSight(sight, { x: 0, y: 0, z: 0 }, DELTA_SECONDS, true);
    stepElementalSight(sight, { x: SIGHT_WALK_LIMIT, y: 0, z: 0 }, DELTA_SECONDS, false);
    expect(sight.isOn).toBe(true);
    stepElementalSight(sight, { x: SIGHT_WALK_LIMIT + 1, y: 0, z: 0 }, DELTA_SECONDS, false);
    expect(sight.isOn).toBe(false);
  });
});
