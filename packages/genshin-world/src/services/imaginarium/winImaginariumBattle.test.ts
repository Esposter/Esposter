import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_BATTLE_FLOWERS, IMAGINARIUM_BATTLE_CHOICE_COUNT } from "#src/services/imaginarium/constants";
import { winImaginariumBattle } from "#src/services/imaginarium/winImaginariumBattle";
import { describe, expect, test } from "vitest";

describe(winImaginariumBattle, () => {
  const alternateCast: ImaginariumMember[] = [
    { isSpecialGuest: false, vigor: 2 },
    { isSpecialGuest: true, vigor: 2 },
    { isSpecialGuest: false, vigor: 2 },
  ];

  test("a Battle Event offers a choice of two Alternate Cast members", () => {
    expect.hasAssertions();

    const result = winImaginariumBattle(0, alternateCast, () => 0);

    expect(result.flowers).toBe(IMAGINARIUM_BATTLE_FLOWERS);
    expect(result.choices).toHaveLength(IMAGINARIUM_BATTLE_CHOICE_COUNT);
    expect(new Set(result.choices).size).toBe(IMAGINARIUM_BATTLE_CHOICE_COUNT);
  });
});
