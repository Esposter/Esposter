import type { Fish } from "#src/models/fishing/Fish";

import { drawFishingZoneTravel } from "#src/services/fishing/drawFishingZoneTravel";
import { describe, expect, test } from "vitest";

describe(drawFishingZoneTravel, () => {
  const FISH = { bonusDuration: [2, 4], bonusOffset: [10, 20], bonusSpeed: [20, 30], bonusWidth: 30 } as Pick<
    Fish,
    "bonusDuration" | "bonusOffset" | "bonusSpeed" | "bonusWidth"
  >;

  test("a zone's travel is drawn from the fish's ranges, and the rod's accuracy widens its width", () => {
    expect.hasAssertions();

    expect(drawFishingZoneTravel(FISH, { attackAcc: 2 }, () => 0.5)).toStrictEqual({
      duration: 3,
      offset: 15,
      speed: 25,
      width: 60,
    });
  });
});
