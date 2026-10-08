import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { describe, expect, test } from "vitest";

describe(computeSurfaceTones, () => {
  test("weights the colour by area and splits the palette where the colours part, darkest first", () => {
    expect.hasAssertions();

    expect(
      computeSurfaceTones(
        [
          { colour: [0, 0, 0], weight: 1 },
          { colour: [255, 255, 255], weight: 3 },
          { colour: [100, 100, 100], weight: 0 },
        ],
        2,
      ),
    ).toStrictEqual({
      color: "#bfbfbf",
      palette: [
        { color: "#000000", share: 0.25 },
        { color: "#ffffff", share: 0.75 },
      ],
    });
  });
});
