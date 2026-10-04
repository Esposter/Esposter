import type { MusicSampleRange } from "#src/audio/MusicSampleRange";

import { MIDI_VELOCITY_MAX } from "#src/audio/constants";

// How far a value lies outside a range, 0 within it
const readOutside = (value: number, low: number, high: number): number =>
  value < low ? low - value : Math.max(value - high, 0);
// The recorded note a note of a pitch and a velocity (0 to 1) plays: the one whose keys hold the pitch, or lie nearest
// It, and of those the one whose velocities hold or lie nearest the velocity on MIDI's scale, as Basic Pitch writes an
// Amplitude into a velocity. A note past an instrument's range plays its nearest recording shifted, as a note between
// Two recordings does
export const selectMusicSample = <T extends MusicSampleRange>(
  samples: T[],
  pitch: number,
  velocity: number,
): T | undefined => {
  const midiVelocity = Math.min(Math.max(Math.round(velocity * MIDI_VELOCITY_MAX), 1), MIDI_VELOCITY_MAX);
  let selected: T | undefined;
  let selectedKeyDistance = Infinity;
  let selectedVelocityDistance = Infinity;
  for (const sample of samples) {
    const keyDistance = readOutside(pitch, sample.lowKey, sample.highKey);
    const velocityDistance = readOutside(midiVelocity, sample.lowVelocity, sample.highVelocity);
    if (
      keyDistance > selectedKeyDistance ||
      (keyDistance === selectedKeyDistance && velocityDistance >= selectedVelocityDistance)
    )
      continue;
    selected = sample;
    selectedKeyDistance = keyDistance;
    selectedVelocityDistance = velocityDistance;
  }
  return selected;
};
