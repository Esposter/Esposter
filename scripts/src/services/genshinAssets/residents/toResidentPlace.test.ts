import { toResidentPlace } from "#src/services/genshinAssets/residents/toResidentPlace";
import { describe, expect, test } from "vitest";

describe(toResidentPlace, () => {
  test("carries a record into the region's axes round the origin, mirroring z and reversing the turn", () => {
    expect.hasAssertions();

    expect(
      toResidentPlace(
        { _configId: 1002, _id: 2, _pos: { x: 12, y: 0, z: 5 }, _rot: { y: 90 } },
        "mondstadt",
        [10, 0, 1],
      ),
    ).toStrictEqual({ npcId: 1002, position: { x: 2, z: -4 }, region: "mondstadt", rotation: -1.5708 });
  });

  test("faces zero where the record gives no turn", () => {
    expect.hasAssertions();

    expect(
      toResidentPlace({ _configId: 1002, _id: 2, _pos: { x: 12, y: 0, z: 5 } }, "mondstadt", [10, 0, 1]),
    ).toStrictEqual({ npcId: 1002, position: { x: 2, z: -4 }, region: "mondstadt", rotation: 0 });
  });
});
