import { InazumaBuildingRoof } from "#src/models/inazuma/InazumaBuildingRoof";
import { createInazumaBuildingGeometry } from "#src/services/inazuma/createInazumaBuildingGeometry";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createInazumaBuildingGeometry, () => {
  test("stacks each storey on the roof below and insets it by the setback", () => {
    expect.hasAssertions();

    const { roofGeometry, timberGeometry } = createInazumaBuildingGeometry({
      depth: 4,
      eaveOverhang: 0.5,
      floorHeight: 1,
      roof: InazumaBuildingRoof.Hipped,
      roofHeight: 2,
      storeyCount: 2,
      storeyHeight: 3,
      storeySetback: 1,
      width: 4,
    });

    // The first roof's eaves reach 2.5 metres out, its base sits at 1 + 3 metres and its ridge two above that, and the
    // Upper storey's roof stands on it, so the roofs span 4 to 11 metres in height
    expect(new Box3().setFromBufferAttribute(roofGeometry.getAttribute("position"))).toStrictEqual(
      new Box3(new Vector3(-2.5, 4, -2.5), new Vector3(2.5, 11, 2.5)),
    );
    expect(new Box3().setFromBufferAttribute(timberGeometry.getAttribute("position")).min.y).toBe(0);
  });
});
