import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { OUTCROP_FIGHT_RADIUS } from "#src/services/leyLine/constants";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { describe, expect, test } from "vitest";

describe(createOutcropCamp, () => {
  const AREA_ID = "mondstadt";
  const PLACEMENT: OutcropPlacement = { id: 97_307, position: { x: 1345.45, z: -942.26 } };
  const camp = createOutcropCamp(AREA_ID, PLACEMENT, () => 0);

  test("an outcrop's camp is placed in the area it is given", () => {
    expect.hasAssertions();

    expect(camp.areaId).toBe(AREA_ID);
  });

  test("an outcrop's enemies stand half its fight radius from its place, inside the fight", () => {
    expect.hasAssertions();

    for (const { position } of camp.members)
      expect(Math.hypot(position.x - PLACEMENT.position.x, position.z - PLACEMENT.position.z)).toBeCloseTo(
        OUTCROP_FIGHT_RADIUS / 2,
      );
  });
});
