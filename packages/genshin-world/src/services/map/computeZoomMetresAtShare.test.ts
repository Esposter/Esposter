import { computeZoomMetresAtShare } from "#src/services/map/computeZoomMetresAtShare";
import { computeZoomShare } from "#src/services/map/computeZoomShare";
import { MAP_VIEW_METRES, MAP_VIEW_METRES_MAX, MAP_VIEW_METRES_MIN } from "#src/services/map/constants";
import { describe, expect, test } from "vitest";

describe(computeZoomMetresAtShare, () => {
  test("reads a view's metres back from its share, and clamps a place past the track", () => {
    expect.hasAssertions();

    expect({
      back: computeZoomMetresAtShare(computeZoomShare(MAP_VIEW_METRES)),
      past: computeZoomMetresAtShare(2),
      under: computeZoomMetresAtShare(-1),
    }).toStrictEqual({ back: expect.closeTo(MAP_VIEW_METRES), past: MAP_VIEW_METRES_MAX, under: MAP_VIEW_METRES_MIN });
  });
});
