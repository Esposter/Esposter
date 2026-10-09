import { selectLostArchitectureInView } from "#src/services/genshinAssets/world/selectLostArchitectureInView";
import { describe, expect, test } from "vitest";

describe(selectLostArchitectureInView, () => {
  const CAPITAL_PLACE = { x: 0, z: 0 };
  const ARCHITECTURE_NAME = "Area_Zd_Build_Train_Guagou_A_01_Vo";

  test("keeps a lost father off the origin in view, and leaves out one at the origin whose subtree is placed", () => {
    expect.hasAssertions();

    const lostInView = { name: ARCHITECTURE_NAME, position: [550, 0, 0] as const };
    const atOrigin = { name: ARCHITECTURE_NAME, position: [0, 0, 0] as const };

    expect(selectLostArchitectureInView([lostInView, atOrigin], CAPITAL_PLACE)).toStrictEqual([lostInView]);
  });
});
