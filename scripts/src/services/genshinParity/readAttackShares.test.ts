import { LISTEN_ATTACK_RISE_DECIBELS } from "#src/services/genshinParity/constants";
import { readAttackShares } from "#src/services/genshinParity/readAttackShares";
import { describe, expect, test } from "vitest";

describe(readAttackShares, () => {
  test("reads the share of frames whose level jumps over the frame before, each side floored", () => {
    expect.hasAssertions();

    const floor = -60;
    // The third frame does not follow the second, so its fall and the rise after the gap are not read
    const frames = [0, 1, 3, 4];

    expect(
      readAttackShares(
        [
          {
            floor,
            game: [floor, floor + LISTEN_ATTACK_RISE_DECIBELS, floor, floor],
            ours: [-Infinity, floor, floor - LISTEN_ATTACK_RISE_DECIBELS, floor],
          },
        ],
        frames,
      ),
    ).toStrictEqual([{ game: 0.5, ours: 0 }]);
  });
});
