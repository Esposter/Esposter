import type { Chroma } from "#src/models/genshinParity/Chroma";

import { scoreChromaWindow } from "#src/services/genshinParity/scoreChromaWindow";
import { describe, expect, test } from "vitest";

const createChroma = (pitchClasses: number[]): Chroma => {
  const classes = new Float32Array(pitchClasses.length * 12);
  for (const [frame, pitchClass] of pitchClasses.entries()) classes[frame * 12 + pitchClass] = 1;
  return { classes, loudness: new Float32Array(pitchClasses.length).fill(1) };
};

describe(scoreChromaWindow, () => {
  // Each frame one pitch class alone, so two frames match only on the same class

  test("finds the lag at which a window's frames fall on the same pitch classes", () => {
    expect.hasAssertions();

    const window = createChroma([0, 1, 2, 3, 4, 5]);
    const other = createChroma([7, 7, 2, 3, 4, 5, 9]);

    expect(scoreChromaWindow(window, 2, 4, other)).toStrictEqual({ lag: 2, score: 1 });
  });
});
