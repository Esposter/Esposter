import { createMondstadtBuildingGeometries } from "#src/services/mondstadt/createMondstadtBuildingGeometries";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createMondstadtBuildingGeometries, () => {
  test("stacks the storeys on the ground floor, each overhanging the one below by the jetty, and raises the gable above them", () => {
    expect.hasAssertions();

    const { plaster, roof } = createMondstadtBuildingGeometries({
      depth: 3,
      dormerCount: 0,
      groundHeight: 2,
      jettyDepth: 0.5,
      roofRise: 3,
      storeyCount: 2,
      storeyHeight: 3,
      width: 4,
    });
    plaster.computeBoundingBox();
    roof.computeBoundingBox();

    expect(plaster.boundingBox).toStrictEqual(new Box3(new Vector3(-2, 2, -2.5), new Vector3(2, 8, 2.5)));
    expect(roof.boundingBox?.max.y).toBe(11);
  });
});
