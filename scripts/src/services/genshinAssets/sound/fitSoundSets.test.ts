import { fitSoundSets } from "#src/services/genshinAssets/sound/fitSoundSets";
import { describe, expect, test } from "vitest";

describe(fitSoundSets, () => {
  test("refines each sound's start and returns the best set of each size", () => {
    expect.hasAssertions();

    const first = { id: 0, powers: [[4], [1]], startFrame: 1 };
    const second = { id: 1, powers: [[2], [1]], startFrame: 2 };
    const window = [[4], [1], [0], [2], [1]];
    const sets = fitSoundSets(window, [first, second], [0]);

    expect(sets).toHaveLength(2);
    expect(sets[1]).toStrictEqual({
      residual: 0,
      set: [
        { ...first, startFrame: 0 },
        { ...second, startFrame: 3 },
      ],
    });
  });
});
