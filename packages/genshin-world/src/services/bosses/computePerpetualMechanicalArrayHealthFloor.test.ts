import { PerpetualMechanicalArrayMode } from "#src/models/bosses/PerpetualMechanicalArrayMode";
import { PERPETUAL_MECHANICAL_ARRAY_HEALTH_GATE } from "#src/services/bosses/perpetualMechanicalArray";
import { computePerpetualMechanicalArrayHealthFloor } from "#src/services/bosses/computePerpetualMechanicalArrayHealthFloor";
import { PERPETUAL_MECHANICAL_ARRAY_FIGHT_START } from "#src/services/bosses/stepPerpetualMechanicalArrayFight";
import { describe, expect, test } from "vitest";

describe(computePerpetualMechanicalArrayHealthFloor, () => {
  test("the boss cannot be damaged past 30% health until Defensive Mode has been triggered", () => {
    expect.hasAssertions();

    expect(computePerpetualMechanicalArrayHealthFloor(PERPETUAL_MECHANICAL_ARRAY_FIGHT_START)).toBe(
      PERPETUAL_MECHANICAL_ARRAY_HEALTH_GATE,
    );
  });

  test("the health gate lifts once Defensive Mode has been triggered", () => {
    expect.hasAssertions();

    expect(
      computePerpetualMechanicalArrayHealthFloor({
        ...PERPETUAL_MECHANICAL_ARRAY_FIGHT_START,
        isDefensiveModeTriggered: true,
        mode: PerpetualMechanicalArrayMode.Attacking,
      }),
    ).toBe(0);
  });
});
