import { computeWheelZoomMetres } from "#src/services/map/computeWheelZoomMetres";
import { MAP_VIEW_METRES, MAP_VIEW_METRES_MAX } from "#src/services/map/constants";
import { describe, expect, test } from "vitest";

describe(computeWheelZoomMetres, () => {
  test("zooms in on a scroll up and out on a scroll down, and stops at the furthest zoom", () => {
    expect.hasAssertions();

    expect({
      furthest: computeWheelZoomMetres(MAP_VIEW_METRES_MAX, 1e6),
      in: computeWheelZoomMetres(MAP_VIEW_METRES, -100) < MAP_VIEW_METRES,
      out: computeWheelZoomMetres(MAP_VIEW_METRES, 100) > MAP_VIEW_METRES,
    }).toStrictEqual({ furthest: MAP_VIEW_METRES_MAX, in: true, out: true });
  });
});
