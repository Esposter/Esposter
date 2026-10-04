import { solveVoicePowers } from "#src/services/genshinAssets/solveVoicePowers";
import { describe, expect, test } from "vitest";

describe(solveVoicePowers, () => {
  test("solves the powers exactly when none is negative", () => {
    expect.hasAssertions();

    expect(
      solveVoicePowers(
        [
          [1, 0],
          [0, 1],
        ],
        [2, 3],
      ),
    ).toStrictEqual([2, 3]);
  });

  test("silences a voice whose power would be negative", () => {
    expect.hasAssertions();

    expect(
      solveVoicePowers(
        [
          [1, 0],
          [0, 1],
        ],
        [2, -3],
      ),
    ).toStrictEqual([2, 0]);
  });
});
