import type { MidiEvent } from "#src/models/MidiEvent";

import { END_OF_TRACK, TRACK_CHUNK_TYPE } from "#src/services/writeMidi/constants";
import { writeChunk } from "#src/services/writeMidi/writeChunk";
import { writeVariableLength } from "#src/services/writeMidi/writeVariableLength";

// Events are written in tick order, and an event at the same tick as another keeps the place it was given
export const writeTrack = (events: MidiEvent[]): number[] => {
  const data: number[] = [];
  let lastTick = 0;
  for (const { bytes, tick } of events.toSorted((firstEvent, secondEvent) => firstEvent.tick - secondEvent.tick)) {
    data.push(...writeVariableLength(tick - lastTick), ...bytes);
    lastTick = tick;
  }
  data.push(0, ...END_OF_TRACK);
  return writeChunk(TRACK_CHUNK_TYPE, data);
};
