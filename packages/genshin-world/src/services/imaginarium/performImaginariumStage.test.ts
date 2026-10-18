import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { performImaginariumStage } from "#src/services/imaginarium/performImaginariumStage";
import { describe, expect, test } from "vitest";

describe(performImaginariumStage, () => {
  test("a stage starts every member at full health and energy", () => {
    expect.hasAssertions();

    const principalCast: ImaginariumMember[] = [
      { burstEnergyCost: 40, energy: 10, healthShare: 0.25, isSpecialGuest: false, maxHealth: 1000, vigor: 2 },
      { burstEnergyCost: 60, energy: 0, healthShare: 0.5, isSpecialGuest: true, maxHealth: 800, vigor: 1 },
    ];

    expect(performImaginariumStage(principalCast)).toStrictEqual([
      { burstEnergyCost: 40, energy: 40, healthShare: 1, isSpecialGuest: false, maxHealth: 1000, vigor: 1 },
      { burstEnergyCost: 60, energy: 60, healthShare: 1, isSpecialGuest: true, maxHealth: 800, vigor: 0 },
    ]);
  });
});
