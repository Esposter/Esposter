import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { SceneGroupSource } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toResidentPlace, () => {
  test("carries a place into the region's axes round the origin, mirroring z and reversing the turn", () => {
    expect.hasAssertions();

    expect(
      toResidentPlace(
        1002,
        { height: 0, position: { x: 12, z: 5 }, rotationY: 90, source: SceneGroupSource.NpcBirths },
        "mondstadt",
        [10, 0, 1],
      ),
    ).toStrictEqual({ npcId: 1002, position: { x: 2, z: -4 }, region: "mondstadt", rotation: -1.5708 });
  });

  test("faces zero where the place gives no turn", () => {
    expect.hasAssertions();

    expect(
      toResidentPlace(1002, { position: { x: 12, z: 5 }, source: SceneGroupSource.NpcBirths }, "mondstadt", [10, 0, 1]),
    ).toStrictEqual({ npcId: 1002, position: { x: 2, z: -4 }, region: "mondstadt", rotation: 0 });
  });
});
