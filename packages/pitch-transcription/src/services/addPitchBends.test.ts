import { CONTOUR_BINS, CONTOUR_BINS_PER_SEMITONE, MIDI_OFFSET } from "#src/constants";
import { addPitchBends } from "#src/services/addPitchBends";
import { describe, expect, test } from "vitest";

// A contour row whose only readings are a peak of one at each of the bins given
const toContourRow = (peakBins: number[]) =>
  Array.from({ length: CONTOUR_BINS }, (_value, bin) => (peakBins.includes(bin) ? 1 : 0));

describe(addPitchBends, () => {
  const middlePitch = 60;
  const middleBin = (middlePitch - MIDI_OFFSET) * CONTOUR_BINS_PER_SEMITONE;

  test.each<[string, number, number[][], number[]]>([
    ["the middle of the range", middlePitch, [[middleBin + 1], [middleBin - 1]], [1, -1]],
    ["the bottom edge, the search clipped at bin 0", MIDI_OFFSET, [[1]], [1]],
    ["a tie, to the lower bin", middlePitch, [[middleBin - 1, middleBin + 1]], [-1]],
  ])(
    "reads each frame's bend as its contour's offset in bins from the note's pitch, %s",
    (_label, pitchMidi, peakBinsByFrame, expected) => {
      expect.hasAssertions();

      const note = { amplitude: 1, durationFrames: peakBinsByFrame.length, pitchMidi, startFrame: 0 };
      const contours = peakBinsByFrame.map((peakBins) => toContourRow(peakBins));

      expect(addPitchBends(contours, [note])).toStrictEqual([{ ...note, pitchBends: expected }]);
    },
  );
});
