import type { CityArea } from "#src/models/genshinAssets/world/CityArea";

import { ARCHITECTURE_VIEW_METRES } from "#src/services/genshinAssets/world/constants";
import { selectCityAreasInView } from "#src/services/genshinAssets/world/selectCityAreasInView";
import { describe, expect, test } from "vitest";

const createCityArea = (code: string, minX: number, maxX: number): CityArea => ({
  centroid: { x: (minX + maxX) / 2, z: 0 },
  code,
  extent: { maxX, maxZ: 1, minX, minZ: -1 },
  placementCount: 1,
});

describe(selectCityAreasInView, () => {
  test("keeps every city area whose extent comes within the architecture radius, nearest first", () => {
    expect.hasAssertions();

    const containing = createCityArea("a", -1, 1);
    const near = createCityArea("b", ARCHITECTURE_VIEW_METRES, ARCHITECTURE_VIEW_METRES + 1);
    const far = createCityArea("c", ARCHITECTURE_VIEW_METRES + 1, ARCHITECTURE_VIEW_METRES + 2);

    expect(selectCityAreasInView([near, far, containing], { x: 0, z: 0 })).toStrictEqual([containing, near]);
  });
});
