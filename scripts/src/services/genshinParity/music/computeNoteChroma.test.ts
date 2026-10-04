import { computeNoteChroma } from "#src/services/genshinParity/music/computeNoteChroma";
import { CHROMA_FRAME_LENGTH } from "#src/services/genshinParity/shared/constants";
import { describe, expect, test } from "vitest";

describe(computeNoteChroma, () => {
  test("weighs a note on its pitch class by the share of each frame it sounds through", () => {
    expect.hasAssertions();

    const { classes, loudness } = computeNoteChroma(
      [{ amplitude: 1, durationSeconds: 0.5, pitchMidi: 69, startTimeSeconds: 0 }],
      3,
      CHROMA_FRAME_LENGTH,
    );
    const firstClasses = [...classes.subarray(0, 12)];

    expect([...loudness]).toStrictEqual([0.5, 0.20703125, 0]);
    expect(firstClasses.indexOf(Math.max(...firstClasses))).toBe(9);
    expect([...classes.subarray(24)]).toStrictEqual(Array.from({ length: 12 }, () => 0));
  });
});
