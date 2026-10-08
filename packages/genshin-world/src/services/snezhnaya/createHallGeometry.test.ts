import { createHallGeometry } from "#src/services/snezhnaya/createHallGeometry";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createHallGeometry, () => {
  test("stands its first storey at full width and rises to the height of every storey", () => {
    expect.hasAssertions();

    const geometry = createHallGeometry({ depth: 8, setback: 1, storeyCount: 3, storeyHeight: 2, width: 10 });
    geometry.computeBoundingBox();

    expect(geometry.boundingBox).toStrictEqual(new Box3(new Vector3(-5, 0, -4), new Vector3(5, 6, 4)));
  });
});
