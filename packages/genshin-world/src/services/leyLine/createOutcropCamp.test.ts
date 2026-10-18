import type { OutcropPlacement } from "#src/models/leyLine/OutcropPlacement";

import { computeOutcropCampId } from "#src/services/leyLine/computeOutcropCampId";
import { OUTCROP_CAMP_ENEMY_KIND_IDS, OUTCROP_CAMP_SIZE, OUTCROP_FIGHT_RADIUS } from "#src/services/leyLine/constants";
import { createOutcropCamp } from "#src/services/leyLine/createOutcropCamp";
import { describe, expect, test } from "vitest";

describe(createOutcropCamp, () => {
  const AREA_ID = "mondstadt";
  const PLACEMENT: OutcropPlacement = { id: 97_307, position: { x: 1345.45, z: -942.26 } };
  const camp = createOutcropCamp(AREA_ID, PLACEMENT, () => 0);

  test("touching an outcrop spawns its enemies", () => {
    expect.hasAssertions();

    expect(camp.id).toBe(computeOutcropCampId(PLACEMENT.id));
    expect(camp.areaId).toBe(AREA_ID);
    expect(camp.members.map(({ enemyKindId }) => enemyKindId)).toStrictEqual(
      Array.from({ length: OUTCROP_CAMP_SIZE }, () => OUTCROP_CAMP_ENEMY_KIND_IDS[0]),
    );
  });

  test("an outcrop's enemies stand within its fight radius", () => {
    expect.hasAssertions();

    for (const { position } of camp.members)
      expect(Math.hypot(position.x - PLACEMENT.position.x, position.z - PLACEMENT.position.z)).toBeLessThanOrEqual(
        OUTCROP_FIGHT_RADIUS,
      );
  });
});
