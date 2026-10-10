import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { GameDataset } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(buildMapPointSlices, () => {
  test("keys each region's places by dataset and region, and reports each region in order", () => {
    expect.hasAssertions();
    const place = { id: "chest-1", kind: "Common", position: { x: 11.5, z: -22.25 } };
    expect(
      buildMapPointSlices(
        GameDataset.Chests,
        { places: { fontaine: [], mondstadt: [place] }, skippedUnderground: 1, skippedUnmapped: 0 },
        "chests",
      ),
    ).toStrictEqual({
      notes: [
        "fontaine: 0 chests",
        "mondstadt: 1 chests",
        "1 on the layers under the ground and 0 in no mapped region, left out",
      ],
      objects: { "chests/fontaine": [], "chests/mondstadt": [place] },
    });
  });
});
