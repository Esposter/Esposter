import { findSoundStart } from "#src/services/genshinAssets/sound/findSoundStart";
import { describe, expect, test } from "vitest";

describe(findSoundStart, () => {
  test("finds where a sound sits in a window, judged on what the window still holds of it", () => {
    expect.hasAssertions();

    const sound = [[1], [4], [1]];
    const window = [[0], [0], [1], [4]];

    expect(findSoundStart(window, sound, [0])).toStrictEqual({ score: 1, startFrame: 2 });
  });
});
