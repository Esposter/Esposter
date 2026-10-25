import type { NoteEvent } from "#src/models/NoteEvent";
import type { NoteEventTime } from "#src/models/NoteEventTime";

import { toSeconds } from "#src/services/convertNotesToSeconds/toSeconds";

// Notes in the model's frames timed in seconds, Basic Pitch's `noteFramesToTime`
export const convertNotesToSeconds = (notes: NoteEvent[]): NoteEventTime[] =>
  notes.map(({ amplitude, durationFrames, pitchBends, pitchMidi, startFrame }) => {
    const startTimeSeconds = toSeconds(startFrame);
    return {
      amplitude,
      durationSeconds: toSeconds(startFrame + durationFrames) - startTimeSeconds,
      pitchBends,
      pitchMidi,
      startTimeSeconds,
    };
  });
