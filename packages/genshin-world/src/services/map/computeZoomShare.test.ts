import { computeZoomShare } from "#src/services/map/computeZoomShare";
import { MAP_VIEW_METRES_MAX, MAP_VIEW_METRES_MIN } from "#src/services/map/constants";
import { describe, expect, test } from "vitest";

describe(computeZoomShare, () => {
  test("places the closest and the furthest zoom at the track's ends", () => {
    expect.hasAssertions();

    expect({
      closest: computeZoomShare(MAP_VIEW_METRES_MIN),
      furthest: computeZoomShare(MAP_VIEW_METRES_MAX),
    }).toStrictEqual({ closest: 0, furthest: 1 });
  });
});
