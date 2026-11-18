import { selectRetiredGroundKeys } from "#src/services/genshinAssets/fit/selectRetiredGroundKeys";
import { describe, expect, test } from "vitest";

describe(selectRetiredGroundKeys, () => {
  test("retires the plateau once the publish stores the last outlined area's piece, a split area's quarters counting as its piece", () => {
    expect.hasAssertions();

    expect(
      selectRetiredGroundKeys({
        areaIds: ["one", "two"],
        lockKeys: ["ground/alpha", "ground/alpha/one/0", "ground/alpha/one/1"],
        publishedKeys: ["ground/alpha/two"],
        region: "alpha",
      }),
    ).toStrictEqual(["ground/alpha"]);
  });

  test("keeps the plateau while an outlined area has no piece in the lock after the publish", () => {
    expect.hasAssertions();

    expect(
      selectRetiredGroundKeys({
        areaIds: ["one", "two"],
        lockKeys: ["ground/alpha"],
        publishedKeys: ["ground/alpha/one"],
        region: "alpha",
      }),
    ).toStrictEqual([]);
  });

  test("keeps the plateau when the publish stores no piece of its region", () => {
    expect.hasAssertions();

    expect(
      selectRetiredGroundKeys({
        areaIds: ["one"],
        lockKeys: ["ground/alpha", "ground/alpha/one", "ground/beta/one"],
        publishedKeys: ["ground/beta/one"],
        region: "alpha",
      }),
    ).toStrictEqual([]);
  });

  test("keeps the plateau when the region outlines no area, so no piece could stand in its place", () => {
    expect.hasAssertions();

    expect(
      selectRetiredGroundKeys({
        areaIds: [],
        lockKeys: ["ground/alpha"],
        publishedKeys: ["ground/alpha/one"],
        region: "alpha",
      }),
    ).toStrictEqual([]);
  });
});
