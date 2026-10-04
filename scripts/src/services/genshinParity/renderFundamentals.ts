import type { NoteEventTime } from "pitch-transcription/notes";

import { toFrequency } from "#src/services/genshinAssets/toFrequency";
import { RELEASE_TIME_CONSTANTS } from "genshin-engine";

// A voice's notes as pure tones at their fundamentals, into `length` frames: each at its velocity from its first frame
// And faded with `release` as its time constant once it ends, the sound with nothing but the notes' pitches in it
export const renderFundamentals = (
  notes: NoteEventTime[],
  release: number,
  tuning: number,
  sampleRate: number,
  length: number,
): Float32Array => {
  const output = new Float32Array(length);
  for (const { amplitude, durationSeconds, pitchMidi, startTimeSeconds } of notes) {
    const frequency = toFrequency(pitchMidi + tuning);
    const startFrame = Math.round(startTimeSeconds * sampleRate);
    const endFrame = startFrame + Math.round(durationSeconds * sampleRate);
    const lastFrame = Math.min(endFrame + Math.ceil(release * RELEASE_TIME_CONSTANTS * sampleRate), length - 1);
    for (let frame = startFrame; frame <= lastFrame; frame++) {
      const fade = frame > endFrame ? Math.exp(-(frame - endFrame) / sampleRate / release) : 1;
      const phase = (2 * Math.PI * frequency * (frame - startFrame)) / sampleRate;
      output[frame] = (output[frame] ?? 0) + amplitude * fade * Math.sin(phase);
    }
  }
  return output;
};
