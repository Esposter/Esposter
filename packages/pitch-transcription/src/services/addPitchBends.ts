import type { NoteEvent } from "#src/models/NoteEvent";

import {
  CONTOUR_BINS,
  CONTOUR_BINS_PER_SEMITONE,
  MIDI_OFFSET,
  PITCH_BEND_STANDARD_DEVIATION,
  PITCH_BEND_TOLERANCE,
} from "#src/constants";
import { takeOne } from "@esposter/shared";

// Weights the contour bins around a note's own, largest at its own bin and falling away as a Gaussian
const weights = Array.from({ length: PITCH_BEND_TOLERANCE * 2 + 1 }, (_, offset) =>
  Math.exp(-((offset - PITCH_BEND_TOLERANCE) ** 2) / (2 * PITCH_BEND_STANDARD_DEVIATION ** 2)),
);
// Each note with its pitch bend at every frame it spans: the contour bin within `PITCH_BEND_TOLERANCE` of its own whose
// Weighted reading is largest, as its offset in bins (a third of a semitone each) from the note's own. A tie goes to the
// Lower bin, as NumPy's `argmax` breaks it
export const addPitchBends = (contours: number[][], notes: NoteEvent[]): NoteEvent[] =>
  notes.map((note) => {
    const bin = (note.pitchMidi - MIDI_OFFSET) * CONTOUR_BINS_PER_SEMITONE;
    const start = Math.max(bin - PITCH_BEND_TOLERANCE, 0);
    const end = Math.min(bin + PITCH_BEND_TOLERANCE + 1, CONTOUR_BINS);
    const pitchBends = contours.slice(note.startFrame, note.startFrame + note.durationFrames).map((row) => {
      let bestBin = start;
      let bestReading = -Infinity;
      for (let contourBin = start; contourBin < end; contourBin++) {
        const reading = takeOne(row, contourBin) * takeOne(weights, contourBin - bin + PITCH_BEND_TOLERANCE);
        if (reading <= bestReading) continue;
        bestBin = contourBin;
        bestReading = reading;
      }
      return bestBin - bin;
    });
    return { ...note, pitchBends };
  });
