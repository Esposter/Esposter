import type { NoteEventTime } from "#src/models/NoteEventTime";

import {
  EMPTY_TRACK_NAME,
  HEADER_CHUNK_TYPE,
  MIDI_TICKS_PER_BEAT,
  PIANO_PROGRAM_CHANGE,
} from "#src/services/writeMidi/constants";
import { toUint16 } from "#src/services/writeMidi/toUint16";
import { writeChunk } from "#src/services/writeMidi/writeChunk";
import { writeNoteEvents } from "#src/services/writeMidi/writeNoteEvents";
import { writePitchBendEvents } from "#src/services/writeMidi/writePitchBendEvents";
import { writeTrack } from "#src/services/writeMidi/writeTrack";

// Notes written as a format 1 MIDI file's bytes: a tempo track, then one track, each note's amplitude its velocity. A
// Note's bends are spread evenly over it, and a bend past the range is held at its edge
export const writeMidi = (notes: NoteEventTime[]): Uint8Array => {
  const header = writeChunk(HEADER_CHUNK_TYPE, [...toUint16(1), ...toUint16(2), ...toUint16(MIDI_TICKS_PER_BEAT)]);
  const tempoTrack = writeTrack([{ bytes: EMPTY_TRACK_NAME, tick: 0 }]);
  const noteTrack = writeTrack([
    { bytes: EMPTY_TRACK_NAME, tick: 0 },
    { bytes: PIANO_PROGRAM_CHANGE, tick: 0 },
    ...writeNoteEvents(notes),
    ...writePitchBendEvents(notes),
  ]);

  return new Uint8Array([...header, ...tempoTrack, ...noteTrack]);
};
