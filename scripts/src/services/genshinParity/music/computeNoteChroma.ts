import type { Chroma } from "#src/models/genshinParity/music/Chroma";
import type { NoteEventTime } from "pitch-transcription/notes";

import { normalizeChromaClasses } from "#src/services/genshinParity/music/normalizeChromaClasses";
import { CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH } from "#src/services/genshinParity/shared/constants";

// The pitch classes a set of notes names in each of `computeChroma`'s frames, with no instrument's sound in them: each
// Note weighs on its own pitch class by its velocity and the share of the frame it sounds through, normalised as a
// Signal's are, and a frame's loudness is its weights' sum
export const computeNoteChroma = (notes: NoteEventTime[], frameCount: number, sampleRate: number): Chroma => {
  const classes = new Float32Array(frameCount * 12);
  const loudness = new Float32Array(frameCount);
  const frameSeconds = CHROMA_FRAME_LENGTH / sampleRate;
  for (const { amplitude, durationSeconds, pitchMidi, startTimeSeconds } of notes) {
    const firstFrame = Math.max(
      0,
      Math.floor((startTimeSeconds * sampleRate - CHROMA_FRAME_LENGTH) / CHROMA_HOP_LENGTH),
    );
    for (let frame = firstFrame; frame < frameCount; frame++) {
      const frameStart = (frame * CHROMA_HOP_LENGTH) / sampleRate;
      if (frameStart >= startTimeSeconds + durationSeconds) break;
      const overlap =
        Math.min(frameStart + frameSeconds, startTimeSeconds + durationSeconds) -
        Math.max(frameStart, startTimeSeconds);
      if (overlap <= 0) continue;
      const weight = (amplitude * overlap) / frameSeconds;
      const index = frame * 12 + (pitchMidi % 12);
      classes[index] = (classes[index] ?? 0) + weight;
      loudness[frame] = (loudness[frame] ?? 0) + weight;
    }
  }
  normalizeChromaClasses(classes);
  return { classes, loudness };
};
