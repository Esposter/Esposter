import type { ScenePlacement } from "genshin-engine";

import { toFishingProps } from "#src/services/genshinAssets/fishing/toFishingProps";
import { describe, expect, test } from "vitest";

describe(toFishingProps, () => {
  const PROP_NAME = "Area_Common_Prop_Fishing_03_Vo";
  // A light named for fishing is no prop, so the placement that names one is left out beside the prop
  const LIGHT_NAME = "Area_Common_Light_Fishing_01_Vo";

  test("a fishing-area prop's place, turn and scale are read from its region's layout", () => {
    expect.hasAssertions();

    const placements: ScenePlacement[] = [
      { materials: [], mesh: LIGHT_NAME, position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] },
      { materials: [], mesh: PROP_NAME, position: [1, 2, 3], rotation: [0, 1, 0, 0], scale: [2, 3, 4] },
    ];

    expect(toFishingProps(placements)).toStrictEqual([
      { name: PROP_NAME, position: [1, 2, 3], rotation: [0, 1, 0, 0], scale: [2, 3, 4] },
    ]);
  });
});
