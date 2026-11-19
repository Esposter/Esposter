import type { SilhouetteSize } from "#src/models/kits/wildlife/SilhouetteSize";

import { createSilhouetteGeometry } from "#src/kits/wildlife/createSilhouetteGeometry";
import { assert, describe, expect, test } from "vitest";

describe(createSilhouetteGeometry, () => {
  test("a silhouette stands on the ground within the bounds it is sized from", () => {
    expect.hasAssertions();

    const size: SilhouetteSize = { depth: 0.3, height: 0.2, width: 0.1 };
    const geometry = createSilhouetteGeometry(size);
    geometry.computeBoundingBox();
    assert.exists(geometry.boundingBox);
    const { max, min } = geometry.boundingBox;

    expect(min.y).toBeCloseTo(0);
    expect(max.y).toBeCloseTo(size.height);
    expect(max.x - min.x).toBeCloseTo(size.width);
    expect(max.z - min.z).toBeCloseTo(size.depth);
  });
});
