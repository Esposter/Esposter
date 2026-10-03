import type { NoteEvent } from "#src/models/NoteEvent";
import type { NoteEventTime } from "#src/models/NoteEventTime";

import { ANNOTATIONS_FRAMES_PER_WINDOW, AUDIO_SAMPLE_RATE, FFT_HOP, WINDOW_OFFSET_SECONDS } from "#src/constants";

// A frame's time in the recording: its hop's, pulled back once for every window before it
const toSeconds = (frame: number): number =>
  (frame * FFT_HOP) / AUDIO_SAMPLE_RATE - WINDOW_OFFSET_SECONDS * Math.floor(frame / ANNOTATIONS_FRAMES_PER_WINDOW);
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
