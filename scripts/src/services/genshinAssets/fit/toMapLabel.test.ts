import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";

import { toMapLabel } from "#src/services/genshinAssets/fit/toMapLabel";
import { describe, expect, test } from "vitest";

describe(toMapLabel, () => {
  test("a label sits at the mean of its outline's corners and names its level-one and level-two areas", () => {
    expect.hasAssertions();

    const area: Pick<WorldArea, "areaID1" | "areaID2" | "areaNameTextMapHash"> = {
      areaID1: 6,
      areaID2: 601,
      areaNameTextMapHash: 455287262,
    };
    const outline = [
      { x: 0, z: 0 },
      { x: 6, z: 0 },
      { x: 0, z: 3 },
    ];

    expect(toMapLabel(area, outline)).toStrictEqual({
      levelOneAreaId: 6,
      levelTwoAreaId: 601,
      nameTextId: "455287262",
      x: 2,
      z: 1,
    });
  });
});
