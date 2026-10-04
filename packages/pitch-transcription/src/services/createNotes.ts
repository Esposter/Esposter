import type { ModelReadings } from "#src/models/ModelReadings";
import type { NoteCreationOptions } from "#src/models/NoteCreationOptions";
import type { NoteEvent } from "#src/models/NoteEvent";

import { ENERGY_TOLERANCE, FRAME_THRESHOLD, MIDI_OFFSET, MIN_NOTE_LENGTH, ONSET_THRESHOLD } from "#src/constants";
import { clearPitch } from "#src/services/clearPitch";
import { constrainFrequency } from "#src/services/constrainFrequency";
import { findOnsetPeaks } from "#src/services/findOnsetPeaks";
import { inferOnsets } from "#src/services/inferOnsets";
import { takeOne } from "@esposter/shared";

const readMeanReading = (frames: number[][], start: number, end: number, pitch: number): number => {
  let sum = 0;
  for (let frame = start; frame < end; frame++) sum += takeOne(takeOne(frames, frame), pitch);
  return sum / (end - start);
};
// The model's readings turned into notes, Basic Pitch's `output_to_notes_polyphonic`. Each onset peak, latest first,
// Starts a note that lasts until its pitch's energy stays under the frame threshold for `energyTolerance` frames, and
// Claims that energy for its pitch and the keys either side. Under the melodia trick, the energy no onset claimed is
// Then followed from its largest reading outward both ways into further notes, largest first. A note no longer than
// `minNoteLength` frames is dropped, and its amplitude is its pitch's mean frame reading. The readings handed in are
// Never changed
export const createNotes = (
  { frames, onsets }: Pick<ModelReadings, "frames" | "onsets">,
  {
    energyTolerance = ENERGY_TOLERANCE,
    frameThreshold = FRAME_THRESHOLD,
    isInferringOnsets = true,
    isMelodiaTrick = true,
    maxFrequency,
    minFrequency,
    minNoteLength = MIN_NOTE_LENGTH,
    onsetThreshold = ONSET_THRESHOLD,
  }: NoteCreationOptions = {},
): NoteEvent[] => {
  const frameCount = frames.length;
  const constrainedFrames = constrainFrequency(frames, maxFrequency, minFrequency);
  const constrainedOnsets = constrainFrequency(onsets, maxFrequency, minFrequency);
  const peakOnsets = isInferringOnsets ? inferOnsets(constrainedOnsets, constrainedFrames) : constrainedOnsets;
  const energy = constrainedFrames.map((row) => [...row]);
  const notes: NoteEvent[] = [];

  for (const [startFrame, pitch] of findOnsetPeaks(peakOnsets, onsetThreshold).toReversed()) {
    if (startFrame >= frameCount - 1) continue;
    let end = startFrame + 1;
    let quietFrames = 0;
    for (; end < frameCount - 1 && quietFrames < energyTolerance; end++)
      quietFrames = takeOne(takeOne(energy, end), pitch) < frameThreshold ? quietFrames + 1 : 0;
    end -= quietFrames;
    if (end - startFrame <= minNoteLength) continue;
    for (let frame = startFrame; frame < end; frame++) clearPitch(energy, frame, pitch);
    notes.push({
      amplitude: readMeanReading(constrainedFrames, startFrame, end, pitch),
      durationFrames: end - startFrame,
      pitchMidi: pitch + MIDI_OFFSET,
      startFrame,
    });
  }

  if (!isMelodiaTrick) return notes;
  // Energy is only ever zeroed, so the largest reading left is always the largest not yet claimed: one sort orders
  // Every candidate, where Basic Pitch rescans every reading for each note. A tie goes to the earliest frame and then
  // The lowest pitch, as NumPy's `argmax` breaks it
  const candidates: [number, number, number][] = [];
  for (const [frame, row] of energy.entries())
    for (let pitch = 0; pitch < row.length; pitch++) {
      const reading = takeOne(row, pitch);
      if (reading > frameThreshold) candidates.push([reading, frame, pitch]);
    }
  candidates.sort(
    ([firstReading, firstFrame, firstPitch], [secondReading, secondFrame, secondPitch]) =>
      secondReading - firstReading || firstFrame - secondFrame || firstPitch - secondPitch,
  );

  for (const [reading, middle, pitch] of candidates) {
    const middleRow = takeOne(energy, middle);
    if (takeOne(middleRow, pitch) !== reading) continue;
    middleRow[pitch] = 0;
    let frame = middle + 1;
    let quietFrames = 0;
    for (; frame < frameCount - 1 && quietFrames < energyTolerance; frame++) {
      quietFrames = takeOne(takeOne(energy, frame), pitch) < frameThreshold ? quietFrames + 1 : 0;
      clearPitch(energy, frame, pitch);
    }
    const end = frame - 1 - quietFrames;
    frame = middle - 1;
    quietFrames = 0;
    for (; frame > 0 && quietFrames < energyTolerance; frame--) {
      quietFrames = takeOne(takeOne(energy, frame), pitch) < frameThreshold ? quietFrames + 1 : 0;
      clearPitch(energy, frame, pitch);
    }
    const start = frame + 1 + quietFrames;
    if (end - start <= minNoteLength) continue;
    notes.push({
      amplitude: readMeanReading(constrainedFrames, start, end, pitch),
      durationFrames: end - start,
      pitchMidi: pitch + MIDI_OFFSET,
      startFrame: start,
    });
  }

  return notes;
};
