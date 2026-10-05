import { computeCrossRatio } from "#src/services/genshinAssets/scene/computeCrossRatio";
import { DerivedAssetArrangementMap } from "#src/services/genshinAssets/scene/DerivedAssetArrangementMap";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

describe("derivedAssetArrangementMap", () => {
  const ratios = Object.values(DerivedAssetArrangementMap).flatMap(({ ratios: componentRatios }) =>
    Object.entries(componentRatios),
  );

  test.each(ratios)(
    "%s holds in the fitted data as its reference measures it",
    async (_description, { ends, readEnds }) => {
      expect.hasAssertions();

      const fitted = computeCrossRatio(await readEnds());

      expect(Math.abs(fitted - computeCrossRatio(ends))).toBeLessThanOrEqual(ARRANGEMENT_CROSS_RATIO_TOLERANCE);
    },
  );
});
