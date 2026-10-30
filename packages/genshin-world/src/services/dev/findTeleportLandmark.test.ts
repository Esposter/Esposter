import { DEV_CATALOGUE, DEV_LANDMARK } from "#src/services/dev/constants.test";
import { findTeleportLandmark } from "#src/services/dev/findTeleportLandmark";
import { describe, expect, test } from "vitest";

describe(findTeleportLandmark, () => {
  test("finds the first landmark of an area or of a region, named without case", () => {
    expect.hasAssertions();

    expect({
      area: findTeleportLandmark("windrise", DEV_CATALOGUE, [DEV_LANDMARK]),
      region: findTeleportLandmark("Mondstadt", DEV_CATALOGUE, [DEV_LANDMARK]),
    }).toStrictEqual({ area: DEV_LANDMARK, region: DEV_LANDMARK });
  });

  test("skips a landmark nothing jumps to, and names none for a place the game does not have", () => {
    expect.hasAssertions();

    expect({
      noArrival: findTeleportLandmark("Windrise", DEV_CATALOGUE, [{ ...DEV_LANDMARK, arrival: undefined }]),
      unknown: findTeleportLandmark("Nowhere", DEV_CATALOGUE, [DEV_LANDMARK]),
    }).toStrictEqual({ noArrival: undefined, unknown: undefined });
  });
});
