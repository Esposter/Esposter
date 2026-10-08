import { computePartSurfaces } from "#src/services/genshinAssets/fit/computePartSurfaces";
import { describe, expect, test } from "vitest";

describe(computePartSurfaces, () => {
  test("fits each part apart, leaving out the samples of no part and of no weight", () => {
    expect.hasAssertions();

    expect(
      computePartSurfaces([
        { colour: [255, 255, 255], part: "Figure", weight: 1 },
        { colour: [100, 100, 100], part: "Stone", weight: 3 },
        { colour: [0, 0, 0], part: "", weight: 1 },
        { colour: [50, 50, 50], part: "Stone", weight: 0 },
      ]),
    ).toStrictEqual({
      Figure: { color: "#ffffff", palette: [{ color: "#ffffff", share: 1 }] },
      Stone: { color: "#646464", palette: [{ color: "#646464", share: 1 }] },
    });
  });
});
