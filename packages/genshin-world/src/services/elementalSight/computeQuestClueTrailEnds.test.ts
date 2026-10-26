import type { RegionData } from "#src/models/world/RegionData";

import { computeQuestClueTrailEnds } from "#src/services/elementalSight/computeQuestClueTrailEnds";
import { describe, expect, test } from "vitest";

describe(computeQuestClueTrailEnds, () => {
  const regionData: RegionData = {
    enemyCamps: [],
    goToPlaces: [{ id: "place", position: { x: 30, z: 40 }, radius: 10 }],
    id: "region",
    landmarks: [],
    outcropPlaces: [],
    residents: [],
    rivers: [],
    waterfalls: [],
  };
  const regionDataMap = new Map([[regionData.id, regionData]]);

  test("a quest clue draws a trail once its place is set", () => {
    expect.hasAssertions();

    expect(computeQuestClueTrailEnds(regionDataMap, ["place"])).toStrictEqual([{ x: 30, z: 40 }]);
  });

  test("a quest clue whose place is not placed draws no trail", () => {
    expect.hasAssertions();

    expect(computeQuestClueTrailEnds(regionDataMap, ["unplaced"])).toStrictEqual([]);
  });
});
