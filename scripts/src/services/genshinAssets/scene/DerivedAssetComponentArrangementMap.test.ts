import { computeCrossRatio } from "#src/services/genshinAssets/scene/computeCrossRatio";
import { DerivedAssetComponentArrangementMap } from "#src/services/genshinAssets/scene/DerivedAssetComponentArrangementMap";
import { ARRANGEMENT_CROSS_RATIO_TOLERANCE } from "#src/services/genshinAssets/shared/constants";
import { describe, expect, test } from "vitest";

describe("derivedAssetComponentArrangementMap", () => {
  const ratios = Object.values(DerivedAssetComponentArrangementMap).flatMap(({ ratios: componentRatios }) =>
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
