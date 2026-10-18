import { getResonatedRegionIds } from "#src/services/statue/getResonatedRegionIds";
import { describe, expect, test } from "vitest";

describe(getResonatedRegionIds, () => {
  test("the regions resonated with are those whose statues are unlocked", () => {
    expect.hasAssertions();

    expect(getResonatedRegionIds(new Set(["a-waypoint", "windrise-statue-of-the-seven"]))).toStrictEqual(["mondstadt"]);
  });
});
