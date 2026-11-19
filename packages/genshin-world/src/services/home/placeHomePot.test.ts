import { placeHomePot } from "#src/services/home/placeHomePot";
import { describe, expect, test } from "vitest";

describe(placeHomePot, () => {
  const pot = { maxCountByPlayer: 1, maxCountInScene: 1 };

  test("the pot is set down at the player's feet", () => {
    expect.hasAssertions();

    expect(placeHomePot(pot, undefined, { x: 3, z: -4 })).toStrictEqual({ x: 3, z: -4 });
  });

  test("a second pot is refused while one stands", () => {
    expect.hasAssertions();

    expect(placeHomePot(pot, { x: 3, z: -4 }, { x: 9, z: 9 })).toStrictEqual({ x: 3, z: -4 });
  });
});
