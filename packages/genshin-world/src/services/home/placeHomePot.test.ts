import { placeHomePot } from "#src/services/home/placeHomePot";
import { describe, expect, test } from "vitest";

describe(placeHomePot, () => {
  test("the pot is set down at the player's feet, and a second is refused while the first stands", () => {
    expect.hasAssertions();

    const pot = { maxCountByPlayer: 1, maxCountInScene: 1 };
    const placedPoint = placeHomePot(pot, undefined, { x: 3, z: -4 });

    expect(placedPoint).toStrictEqual({ x: 3, z: -4 });
    expect(placeHomePot(pot, placedPoint, { x: 9, z: 9 })).toStrictEqual({ x: 3, z: -4 });
  });
});
