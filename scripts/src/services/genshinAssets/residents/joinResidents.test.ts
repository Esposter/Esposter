import { joinResidents } from "#src/services/genshinAssets/residents/joinResidents";
import { describe, expect, test } from "vitest";

describe(joinResidents, () => {
  const areaId = "galesong-hill";
  const getAreaId = () => areaId;

  test("places each named, talking NPC once in a region, at the place of its first record there", () => {
    expect.hasAssertions();

    expect(
      joinResidents(
        [
          { npcId: 1002, position: { x: 1, z: 2 }, region: "mondstadt", rotation: 0.5 },
          { npcId: 1002, position: { x: 9, z: 9 }, region: "mondstadt", rotation: 0 },
          { npcId: 1005, position: { x: 3, z: 4 }, region: "liyue", rotation: 0 },
        ],
        new Map([
          [1002, "101"],
          [1005, "102"],
        ]),
        new Map([[1002, [7, 8]]]),
        getAreaId,
      ),
    ).toStrictEqual({
      noName: 0,
      noTalk: 1,
      regions: new Map([
        [
          "mondstadt",
          [{ areaId, day: { position: { x: 1, z: 2 }, rotation: 0.5 }, id: "1002", nameTextId: "101", talkId: "7" }],
        ],
      ]),
      repeated: 1,
    });
  });

  test("leaves out an NPC with no name", () => {
    expect.hasAssertions();

    expect(
      joinResidents(
        [{ npcId: 1002, position: { x: 1, z: 2 }, region: "mondstadt", rotation: 0 }],
        new Map([[1002, ""]]),
        new Map([[1002, [7]]]),
        getAreaId,
      ),
    ).toStrictEqual({ noName: 1, noTalk: 0, regions: new Map(), repeated: 0 });
  });
});
