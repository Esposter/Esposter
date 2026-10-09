import { computeGroundLayerColours } from "#src/services/genshinAssets/fit/fitGroundLayerColours";
import { describe, expect, test } from "vitest";

describe(computeGroundLayerColours, () => {
  test("averages each layer's samples by area and leaves out the samples no layer holds", () => {
    expect.hasAssertions();

    expect(
      computeGroundLayerColours([
        { colour: [0, 0, 0], layer: "Grass", part: "", weight: 1 },
        { colour: [255, 255, 255], layer: "Grass", part: "", weight: 3 },
        { colour: [100, 100, 100], layer: "Rock", part: "", weight: 2 },
        { colour: [50, 50, 50], part: "", weight: 5 },
      ]),
    ).toStrictEqual({ Grass: "#bfbfbf", Rock: "#646464" });
  });
});
