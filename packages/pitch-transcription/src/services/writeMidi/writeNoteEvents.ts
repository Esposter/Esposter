import type { MidiEvent } from "#src/models/MidiEvent";
import type { NoteEventTime } from "#src/models/NoteEventTime";

import { toTicks } from "#src/services/writeMidi/toTicks";
import { toVelocity } from "#src/services/writeMidi/toVelocity";

// A note's off is its start plus its length, each rounded to a tick on its own, so it can sit a tick off their rounded sum
export const writeNoteEvents = (notes: NoteEventTime[]): MidiEvent[] =>
  notes
    .map(({ amplitude, durationSeconds, pitchMidi, startTimeSeconds }) => ({
      amplitude,
      offTick: toTicks(startTimeSeconds) + toTicks(durationSeconds),
      onTick: toTicks(startTimeSeconds),
      pitchMidi,
    }))
    .toSorted((firstNote, secondNote) => firstNote.onTick - secondNote.onTick)
    .flatMap(({ amplitude, offTick, onTick, pitchMidi }) => [
      { bytes: [0x90, pitchMidi, toVelocity(amplitude)], tick: onTick },
      { bytes: [0x80, pitchMidi, 0], tick: offTick },
    ]);
