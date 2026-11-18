import { joinGroundPieces } from "#src/services/genshinAssets/fit/joinGroundPieces";
import { splitGroundPiece } from "#src/services/genshinAssets/fit/splitGroundPiece";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(joinGroundPieces, () => {
  test("covers exactly the samples of its two quarters, in a square over both", () => {
    expect.hasAssertions();

    const quarters = splitGroundPiece({
      centre: { x: 0, z: 0 },
      checkIsInside: () => true,
      half: 300,
      key: "ground/test/area",
    });
    const joined = joinGroundPieces([takeOne(quarters, 2), takeOne(quarters, 3)], "ground/test/area/2-3");

    expect(joined.centre).toStrictEqual({ x: 0, z: 150 });
    expect(joined.half).toBe(300);
    expect(joined.checkIsInside(-100, 100)).toBe(true);
    expect(joined.checkIsInside(100, 100)).toBe(true);
    expect(joined.checkIsInside(-100, -100)).toBe(false);
    expect(joined.checkIsInside(100, -100)).toBe(false);
  });
});
