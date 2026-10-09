import { TRAVELER_KIT } from "#src/services/kit/characters/travelerKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe("TRAVELER_KIT", () => {
  test("reads each talent multiplier from the Anemo form's table, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...TRAVELER_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...TRAVELER_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      TRAVELER_KIT.plungeCollision.talentMultiplier,
      takeOne(TRAVELER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.highPlunge.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.445, 0.434, 0.53, 0.583, 0.708, 0.559, 0.722, 0.639, 1.28, 1.6, 1.76, 0.808];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });
});
