import { CONTOUR_BINS } from "#src/constants";
import { addPitchBends } from "#src/services/addPitchBends";
import { describe, expect, test } from "vitest";

describe(addPitchBends, () => {
  test("reads each frame's bend as its contour's offset in bins from the note's pitch", () => {
    expect.hasAssertions();

    const note = { amplitude: 1, durationFrames: 2, pitchMidi: 60, startFrame: 0 };
    const pitchBin = 117;
    const contours = [pitchBin + 1, pitchBin - 1].map((peakBin) =>
      Array.from({ length: CONTOUR_BINS }, (_, bin) => (bin === peakBin ? 1 : 0)),
    );

    expect(addPitchBends(contours, [note])).toStrictEqual([{ ...note, pitchBends: [1, -1] }]);
  });
});
