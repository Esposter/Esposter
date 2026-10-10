import { computeGroundLayerColours } from "#src/services/genshinAssets/fit/fitGroundLayerColours";
import { describe, expect, test } from "vitest";

describe(computeGroundLayerColours, () => {
  test("classes each sample to its nearest tone in Lab and averages each class by weight", () => {
    expect.hasAssertions();

    expect(
      computeGroundLayerColours(
        [
          { colour: [10, 10, 10], part: "", weight: 1 },
          { colour: [30, 30, 30], part: "", weight: 3 },
          { colour: [240, 240, 240], part: "", weight: 2 },
          { colour: [0, 0, 0], part: "", weight: 0 },
        ],
        { Dark: "#000000", Light: "#ffffff" },
      ),
    ).toStrictEqual({ Dark: "#191919", Light: "#f0f0f0" });
  });

  test("leaves out a layer whose samples hold no weight", () => {
    expect.hasAssertions();

    expect(
      computeGroundLayerColours(
        [
          { colour: [10, 10, 10], part: "", weight: 1 },
          { colour: [240, 240, 240], part: "", weight: 0 },
        ],
        { Dark: "#000000", Light: "#ffffff" },
      ),
    ).toStrictEqual({ Dark: "#0a0a0a" });
  });
});
