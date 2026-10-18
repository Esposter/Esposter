import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_VIGOR } from "#src/services/imaginarium/constants";
import { restoreImaginariumVigor } from "#src/services/imaginarium/restoreImaginariumVigor";
import { describe, expect, test } from "vitest";

describe(restoreImaginariumVigor, () => {
  test("a Mystery Cache's option restores a character's Vigor", () => {
    expect.hasAssertions();

    const member: ImaginariumMember = {
      burstEnergyCost: 40,
      energy: 0,
      healthShare: 1,
      isSpecialGuest: false,
      maxHealth: 1000,
      vigor: 0,
    };

    expect(restoreImaginariumVigor(member)).toStrictEqual({ ...member, vigor: IMAGINARIUM_VIGOR });
  });
});
