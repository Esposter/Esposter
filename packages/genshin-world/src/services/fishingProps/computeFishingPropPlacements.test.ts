import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";

import { computeFishingPropPlacements } from "#src/services/fishingProps/computeFishingPropPlacements";
import { describe, expect, test } from "vitest";

describe(computeFishingPropPlacements, () => {
  const PROP_NAME = "Area_Dq_Prop_Common_Fish_01_Vo";
  const place: FishingPropPlace = {
    name: PROP_NAME,
    position: [0.1, 0, -1],
    rotation: [0, 0.1, 0, 1],
    scale: [1, 0.1, 1],
  };

  test("a prop stands at its layout's place, on the ground beneath it", () => {
    expect.hasAssertions();

    expect(computeFishingPropPlacements(PROP_NAME, [place], () => 2)).toStrictEqual([
      { ...place, position: [0.1, 2, -1] },
    ]);
  });

  test("a prop without a layout place is not drawn", () => {
    expect.hasAssertions();

    expect(computeFishingPropPlacements("", [place], () => 2)).toStrictEqual([]);
  });
});
