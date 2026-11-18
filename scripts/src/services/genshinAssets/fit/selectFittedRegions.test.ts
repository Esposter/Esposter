import type { InteractiveMapRegionFit } from "#src/models/genshinAssets/points/InteractiveMapRegionFit";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { selectFittedRegions } from "#src/services/genshinAssets/fit/selectFittedRegions";
import { INTERACTIVE_MAP_FIT_BAR } from "#src/services/genshinAssets/points/constants";
import { describe, expect, test } from "vitest";

describe(selectFittedRegions, () => {
  const createRegionFit = (region: string, residual: number | undefined): InteractiveMapRegionFit => ({
    matched: 0,
    oculusCount: 0,
    oculusWikiCount: 0,
    region,
    residual,
  });
  const regionFits = [
    createRegionFit(DerivedAssetComponent.Mondstadt, INTERACTIVE_MAP_FIT_BAR),
    createRegionFit(DerivedAssetComponent.Liyue, INTERACTIVE_MAP_FIT_BAR + 1),
  ];

  test("A region whose map fit passes has its waypoints in the world", () => {
    expect.hasAssertions();

    expect(
      selectFittedRegions(regionFits, [DerivedAssetComponent.Mondstadt, DerivedAssetComponent.Liyue]),
    ).toStrictEqual([DerivedAssetComponent.Mondstadt]);
  });

  test("A region whose map fit is over its bar has no waypoints", () => {
    expect.hasAssertions();

    expect(selectFittedRegions(regionFits, [DerivedAssetComponent.Liyue])).toStrictEqual([]);
  });
});
